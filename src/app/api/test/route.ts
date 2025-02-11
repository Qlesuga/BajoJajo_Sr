import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createTwitchChatSubscription } from "~/utils/twitchChatSubscription";

// Type definitions for Twitch webhook payloads
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

  // Get headers in a type-safe way
  const headers: TwitchWebhookHeaders = Object.fromEntries(req.headers);

  // Get the request body as text
  const bodyText = await req.text();

  // Construct the message string correctly
  const message =
    (headers["twitch-eventsub-message-id"] ?? "") +
    (headers["twitch-eventsub-message-timestamp"] ?? "") +
    bodyText;

  const hmac = "sha256=" + getHmac(secret, message);

  // Verify the signature
  if (!verifyMessage(hmac, headers["twitch-eventsub-message-signature"])) {
    return new NextResponse(null, { status: 403 });
  }
  console.log("TWITCH SIGNATURE VERIFIED");

  const requestType = headers["twitch-eventsub-message-type"];

  if (requestType === "webhook_callback_verification") {
    try {
      const notification = JSON.parse(bodyText) as WebhookCallbackPayload;
      console.log(notification);
      createTwitchChatSubscription().catch((err) => {
        console.error(err);
      });
      setTimeout(() => {
        createTwitchChatSubscription().catch((err) => {
          console.error(err);
        });
      }, 5000);
      return new NextResponse(notification.challenge, {
        status: 200,
        headers: { "Content-Type": `${notification.challenge.length}` },
      });
    } catch (error) {
      console.error("Failed to parse webhook verification payload:", error);
      return new NextResponse(null, { status: 400 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
