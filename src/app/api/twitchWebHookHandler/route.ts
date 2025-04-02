"server-only";

import { redis } from "lib/redis";
import { after, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { addSongToUser, setVolume, skipSong } from "~/server/api/routers/song";
import { twitchSendChatMessage } from "~/utils/twitch/twitchSendChatMessage";

interface TwitchWebhookHeaders {
  "twitch-eventsub-message-id"?: string;
  "twitch-eventsub-message-timestamp"?: string;
  "twitch-eventsub-message-signature"?: string;
  "twitch-eventsub-message-type"?: string;
}

interface WebhookCallbackPayload {
  challenge: string;
  conduit_shard: {
    conduit_id: string;
    shard: string;
  };
}

type Subscription = {
  id: string;
  status: "enabled" | "disabled";
  type: string;
  version: string;
  condition: {
    broadcaster_user_id: string;
    user_id: string;
  };
  transport: {
    method: "webhook" | "websocket";
    callback: string;
  };
  created_at: string;
  cost: number;
};

type MessageFragment = {
  type: string;
  text: string;
  cheermote: string | null;
  emote: string | null;
  mention: string | null;
};

type Badge = {
  set_id: string;
  id: string;
  info: string;
};

type Event = {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  chatter_user_id: string;
  chatter_user_login: string;
  chatter_user_name: string;
  message_id: string;
  message: {
    text: string;
    fragments: MessageFragment[];
  };
  color: string;
  badges: Badge[];
  message_type: string;
  cheer: string | null;
  reply: string | null;
  channel_points_custom_reward_id: string | null;
};

type TwitchWebhookPayload = {
  subscription: Subscription;
  event: Event;
};

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
const VOTESKIP_PERCENTAGE = 0.5;
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
) {
  const notification = bodyJson as TwitchWebhookPayload;
  const badges = notification.event.badges;
  const senderID = notification.event.chatter_user_id;
  if (senderID == process.env.TWITCH_BOT_USER_ID) {
    return new NextResponse(null, { status: 200 });
  }
  const broadcasterID = notification.event.broadcaster_user_id;
  if (
    notification.subscription.type == "channel.chat.message" &&
    notification.event.reply == null
  ) {
    const splitMessage = notification.event.message.text.split(" ");
    let responseMessage: string | null = null;

    const key = `chatter:${broadcasterID}`;
    if (!(await redis.hGet(key, senderID))) {
      await redis.hSet(key, senderID, 0);
    }
    await redis.hExpire(key, senderID, CHATTER_TTL_IN_SECOUNDS);

    console.info(splitMessage);
    if (splitMessage[0] == "!sr") {
      responseMessage = await addSongToUser(broadcasterID, splitMessage[1]!);
    } else if (splitMessage[0] == "!skip") {
      let isMod = false;
      badges.forEach((badge) => {
        if (badge.set_id == "moderator" || badge.set_id == "broadcaster") {
          isMod = true;
        }
      });
      console.log(isMod);
      if (isMod) {
        responseMessage = skipSong(broadcasterID);
      } else {
        responseMessage = "you are unauthorized to skip, use !voteskip";
      }
    } else if (splitMessage[0] == "!volume") {
      const volume = splitMessage[1];
      if (volume) {
        responseMessage = setVolume(broadcasterID, volume);
      }
    } else if (splitMessage[0] == "!srping") {
      responseMessage = "pong :3";
    } else if (splitMessage[0] == "!voteskip") {
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
          await redis.hSet(key, field, "0");
          await redis.hExpire(key, field, 60);
        }
        responseMessage = skipSong(broadcasterID);
      } else {
        responseMessage = `voteskip: ${amontOfChatterWhoSkipped}/${progress}`;
      }
    }
    if (responseMessage && responseMessage != "") {
      await twitchSendChatMessage(
        broadcasterID,
        responseMessage,
        notification.event.message_id,
      );
    }
  }
}

export const config = {
  runtime: "nodejs",
};
