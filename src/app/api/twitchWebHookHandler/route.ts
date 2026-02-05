"server-only";

import { redis } from "lib/redis";
import { after, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { playSong, setVolume, stopSong, skipSong } from "lib/subscriptedUsers/songHandling";
import { twitchSendChatMessage } from "~/utils/twitch/twitchSendChatMessage";
import type {
  Badge,
  TwitchWebhookPayload,
  WebhookCallbackPayload,
  TwitchWebhookHeaders,
} from "types/twitch";
import { hasModeratorBadge } from "~/utils/twitch/hasModeratorBadge";
import { hasBroadcasterBadge } from "~/utils/twitch/hasBroadcasterBadge";
import { getCurrentSongInfo } from "~/utils/song/getCurrentSongInfo";
import { addSongToUser, forceAddSongToUser } from "~/server/api/routers/song";
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

const CHATTER_TTL_IN_SECOUNDS = 3 * 60;
const VOTESKIP_PERCENTAGE = 0.66;

type CommandHandlerResult = {
  message: string | null;
  shouldResponse?: boolean;
};

type CommandContext = {
  broadcasterID: string;
  username: string;
  messageId: string;
  broadcasterName: string;
  param: string | undefined;
  isMod: boolean;
  isBroadcaster: boolean;
  chatterKey: string;
  senderID: string;
};

async function handleVoteSkip(
  broadcasterID: string,
  chatterKey: string,
  senderID: string,
): Promise<CommandHandlerResult> {
  await redis.hSet(chatterKey, senderID, 1);
  await redis.hExpire(chatterKey, senderID, CHATTER_TTL_IN_SECOUNDS);

  const chatters = Object.entries(await redis.hGetAll(chatterKey));
  const chattersWhoSkipped = chatters
    .filter(([_field, value]) => value === "1")
    .map(([field]) => field);
  const amountOfChattersWhoSkipped = chattersWhoSkipped.length;
  const progress = Math.ceil(chatters.length * VOTESKIP_PERCENTAGE);

  if (amountOfChattersWhoSkipped >= progress) {
    for (const field of chattersWhoSkipped) {
      redis.hSet(chatterKey, field, "0").catch((e) => console.error(e));
    }
    const message = await skipSong(broadcasterID);
    return { message, shouldResponse: false };
  }

  return {
    message: `voteskip: ${amountOfChattersWhoSkipped}/${progress}`,
  };
}

async function handleCommand(
  command: string,
  context: CommandContext,
): Promise<CommandHandlerResult> {
  const {
    broadcasterID,
    username,
    messageId,
    broadcasterName,
    param,
    isMod,
    isBroadcaster,
    chatterKey,
    senderID,
  } = context;

  // Song request commands
  if (command === "!sr" && param) {
    const message = await addSongToUser(
      broadcasterID,
      param,
      username,
      messageId,
    );
    return { message };
  }

  if (command === "!forcesr" && param && isMod) {
    const message = await forceAddSongToUser(
      broadcasterID,
      param,
      username,
      messageId,
    );
    return { message };
  }

  // Skip commands
  if (command === "!forceskip") {
    if (isMod) {
      const message = await skipSong(broadcasterID);
      return { message };
    }
    return {
      message: "you are unauthorized to use skip, use !voteskip instead",
    };
  }

  if (command === "!voteskip" || command === "!skip") {
    return handleVoteSkip(broadcasterID, chatterKey, senderID);
  }

  // Moderator-only commands
  if (command === "!volume" && param && isMod) {
    const message = setVolume(broadcasterID, param);
    return { message };
  }

  // Playback control commands
  if (command === "!stop") {
    stopSong(broadcasterID);
    return { message: null };
  }

  if (command === "!play") {
    playSong(broadcasterID);
    return { message: null };
  }

  // Info commands
  if (command === "!srping") {
    return { message: "pong :3" };
  }

  if (command === "!queue") {
    return {
      message: `${process.env.NEXTAUTH_URL}/queue/${broadcasterName}`,
    };
  }

  if (command === "!current") {
    const song = await getCurrentSongInfo(broadcasterID);
    return {
      message: `currently is playing: ${song ? song.title : "nothing"}`,
    };
  }

  if (command === "!whenmysr") {
    const message = await whenUserSong(broadcasterID, username);
    return { message };
  }

  // Broadcaster-only commands
  if (command === "!clear" && isBroadcaster) {
    const message = await clearSongQueue(broadcasterID);
    return { message };
  }

  if (command === "!sron" && isBroadcaster) {
    const message = await turnSrOn(broadcasterID);
    return { message, shouldResponse: true };
  }

  if (command === "!sroff" && isBroadcaster) {
    const message = await turnSrOff(broadcasterID);
    return { message, shouldResponse: true };
  }

  return { message: null };
}
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

  const requestType = headers["twitch-eventsub-message-type"];

  if (requestType === "webhook_callback_verification") {
    try {
      const notification = bodyJson as WebhookCallbackPayload;
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
): Promise<undefined> {
  const { event, subscription } = bodyJson as TwitchWebhookPayload;
  const badges = event.badges;
  const senderID = event.chatter_user_id;
  const broadcasterID = event.broadcaster_user_id;
  const splitMessage = event.message.text.split(" ");
  const command = splitMessage[0];
  const param = splitMessage[1];
  const isSrOn = await isSrTurnedOn(broadcasterID);
  const username = event.chatter_user_name;
  const isBroadcaster = hasBroadcasterBadge(badges);
  const isMod = hasModeratorBadge(badges);

  if (
    !isSrOn ||
    subscription.type != "channel.chat.message" ||
    event.reply != null ||
    senderID == process.env.TWITCH_BOT_USER_ID
  ) {
    if (command != "!sron") {
      return;
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
    return;
  }

  const commandResult = await handleCommand(command, {
    broadcasterID,
    username,
    messageId: event.message_id,
    broadcasterName: event.broadcaster_user_name,
    param,
    isMod,
    isBroadcaster,
    chatterKey: key,
    senderID,
  });

  responseMessage = commandResult.message;
  if (commandResult.shouldResponse !== undefined) {
    shouldResponse = commandResult.shouldResponse;
  }

  if (!responseMessage || responseMessage == "") {
    return;
  }

  await twitchSendChatMessage(
    broadcasterID,
    responseMessage,
    shouldResponse ? event.message_id : null,
  );
}

export const config = {
  runtime: "nodejs",
};
