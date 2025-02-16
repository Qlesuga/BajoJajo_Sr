"server-only";

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { addSongToUser, skipSong, userID } from "~/server/api/routers/song";

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
      console.log(notification);
      return new NextResponse(notification.challenge, {
        status: 200,
        headers: { "Content-Type": `${notification.challenge.length}` },
      });
    } catch (error) {
      console.error("Failed to parse webhook verification payload:", error);
      return new NextResponse(null, { status: 400 });
    }
  }
  const notification = bodyJson as TwitchWebhookPayload;
  if (notification.subscription.type == "channel.chat.message") {
    const splitMessage = notification.event.message.text.split(" ");
    if (splitMessage[0] == "!sr") {
      console.log("song requested");
      await addSongToUser(userID, splitMessage[1]!);
    } else if (splitMessage[0] == "!skip") {
      console.log("skip");
      skipSong(userID);
    }
    console.log(splitMessage);
  } else {
    console.log("NEW TWITCH");
    console.log(bodyJson);
  }
  return new NextResponse(null, { status: 200 });
}

export const config = {
  runtime: "nodejs",
};
