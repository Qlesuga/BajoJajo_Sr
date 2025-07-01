"server-only";

import { redis } from "lib/redis";
import { after, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  playSong,
  setVolume,
  stopSong,
  skipSong,
} from "lib/subscriptedUsers/songHandling";
import { twitchSendChatMessage } from "~/utils/twitch/twitchSendChatMessage";
import type {
  Badge,
  TwitchWebhookPayload,
  WebhookCallbackPayload,
  TwitchWebhookHeaders,
} from "types/twitch";
import { getCurrentSongInfo } from "~/utils/song/getCurrentSongInfo";
import { addSongToUser } from "~/server/api/routers/song";
import { clearSongQueue } from "~/utils/song/clearSongQueue";
import { isSrTurnedOn } from "~/utils/isSrTurnedOn";
import { turnSrOn } from "~/utils/turnSrOn";
import { turnSrOff } from "~/utils/turnSrOff";
import whenUserSong from "~/utils/whenUserSong";

function getHmac(secret: string, message: string): string {
  return createHmac("sha256", secret).update(message).digest("hex");
}

function verifyMessage(hmac: string, verifySignature?: string): boolean {
  if (!verifySignature) return false;
  try {
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
  } catch {
    return false;
  }
}

function isModerator(badges: Badge[]) {
  let isMod = false;
  badges.forEach((badge) => {
    if (badge.set_id == "moderator" || badge.set_id == "broadcaster") {
      isMod = true;
    }
  });
  return isMod;
}

function isBroadcaster(badges: Badge[]) {
  let isBroadcaster = false;
  badges.forEach((badge) => {
    if (badge.set_id == "broadcaster") {
      isBroadcaster = true;
    }
  });
  return isBroadcaster;
}

const CHATTER_TTL_IN_SECOUNDS = 3 * 60;
const VOTESKIP_PERCENTAGE = 0.66;
export async function POST(req: Request): Promise<NextResponse> {
  const secret = process.env.TWITCH_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing TWITCH_WEBHOOK_SECRET environment variable");
    return new NextResponse(null, { status: 500 });
  }

  const headers: TwitchWebhookHeaders = Object.fromEntries(req.headers);
  const bodyText = await req.text();
  const bodyJson = JSON.parse(bodyText) as
    | TwitchWebhookPayload
    | WebhookCallbackPayload;

  const message =
    (headers["twitch-eventsub-message-id"] ?? "") +
    (headers["twitch-eventsub-message-timestamp"] ?? "") +
    bodyText;

  const hmac = "sha256=" + getHmac(secret, message);

  if (!verifyMessage(hmac, headers["twitch-eventsub-message-signature"])) {
    return new NextResponse(null, { status: 403 });
  }
  console.log("TWITCH SIGNATURE VERIFIED");

  const requestType = headers["twitch-eventsub-message-type"];

  if (requestType === "webhook_callback_verification") {
    try {
      const notification = bodyJson as WebhookCallbackPayload;
      console.log("sucesfull twitch verification");
      const challenge = notification.challenge;
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": `${challenge.length}` },
      });
    } catch (error) {
      console.error("Failed to parse webhook verification payload:", error);
      return new NextResponse(null, { status: 400 });
    }
  }

  after(() => handleTwitchMessage(bodyJson));
  return new NextResponse(null, { status: 200 });
}

async function handleTwitchMessage(
  bodyJson: TwitchWebhookPayload | WebhookCallbackPayload,
): Promise<null> {
  const { event, subscription } = bodyJson as TwitchWebhookPayload;
  const badges = event.badges;
  const senderID = event.chatter_user_id;
  const broadcasterID = event.broadcaster_user_id;
  const splitMessage = event.message.text.split(" ");
  const command = splitMessage[0];
  const param = splitMessage[1];
  const isSrOn = await isSrTurnedOn(broadcasterID);

  if (
    !isSrOn ||
    subscription.type != "channel.chat.message" ||
    event.reply != null ||
    senderID == process.env.TWITCH_BOT_USER_ID
  ) {
    if (command != "!sron") {
      return null;
    }
  }

  let responseMessage: string | null = null;
  let shouldResponse = true;

  const key = `chatter:${broadcasterID}`;
  if (!(await redis.hGet(key, senderID))) {
    await redis.hSet(key, senderID, 0);
  }
  await redis.hExpire(key, senderID, CHATTER_TTL_IN_SECOUNDS);

  console.info(broadcasterID, splitMessage);
  if (command?.charAt(0) != "!" || splitMessage.length > 2) {
    return null;
  }
  if (command == "!sr" && param) {
    responseMessage = await addSongToUser(
      broadcasterID,
      param,
      event.chatter_user_name,
      event.message_id,
    );
  }
  if (command == "!forcesr" && param && isModerator(badges)) {
    responseMessage = await addSongToUser(
      broadcasterID,
      param,
      event.chatter_user_name,
      event.message_id,
    );
  } else if (command == "!forceskip") {
    const isMod = isModerator(badges);
    if (isMod) {
      responseMessage = skipSong(broadcasterID);
    } else {
      responseMessage =
        "you are unauthorized to use skip, use !voteskip instead";
    }
  } else if (command == "!volume" && param && isModerator(badges)) {
    responseMessage = setVolume(broadcasterID, param);
  } else if (command == "!srping") {
    responseMessage = "pong :3";
  } else if (command == "!voteskip" || command == "!skip") {
    await redis.hSet(key, senderID, 1);
    await redis.hExpire(key, senderID, CHATTER_TTL_IN_SECOUNDS);

    const chatters = Object.entries(await redis.hGetAll(key));
    const chattersWhoSkipped = chatters
      .filter(([_field, value]) => value === "1")
      .map(([field]) => field);
    const amontOfChatterWhoSkipped = chattersWhoSkipped.length;
    const progress = Math.ceil(chatters.length * VOTESKIP_PERCENTAGE);
    if (amontOfChatterWhoSkipped >= progress) {
      for (const field of chattersWhoSkipped) {
        redis.hSet(key, field, "0").catch((e) => console.error(e));
      }
      responseMessage = skipSong(broadcasterID);
      shouldResponse = false;
    } else {
      responseMessage = `voteskip: ${amontOfChatterWhoSkipped}/${progress}`;
    }
  } else if (command == "!queue") {
    responseMessage = `${process.env.NEXTAUTH_URL}/queue/${event.broadcaster_user_name}`;
  } else if (command == "!current") {
    const song = await getCurrentSongInfo(broadcasterID);
    responseMessage = `currently is playing: ${song ? song.title : "nothing"}`;
  } else if (command == "!stop") {
    stopSong(broadcasterID);
  } else if (command == "!play") {
    playSong(broadcasterID);
  } else if (command == "!clear" && isBroadcaster(badges)) {
    responseMessage = await clearSongQueue(broadcasterID);
  } else if (command == "!sron" && isBroadcaster(badges)) {
    responseMessage = await turnSrOn(broadcasterID);
    shouldResponse = true;
  } else if (command == "!sroff" && isBroadcaster(badges)) {
    responseMessage = await turnSrOff(broadcasterID);
    shouldResponse = true;
  } else if (command == "!whenmysr") {
    responseMessage = await whenUserSong(
      broadcasterID,
      event.chatter_user_name,
    );
  }
  if (!responseMessage || responseMessage == "") {
    return null;
  }

  await twitchSendChatMessage(
    broadcasterID,
    responseMessage,
    shouldResponse ? event.message_id : null,
  );

  return null;
}

export const config = {
  runtime: "nodejs",
};
