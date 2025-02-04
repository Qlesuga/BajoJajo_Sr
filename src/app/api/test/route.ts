import type { NextApiResponse, NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

function getHmac(secret, message) {
  return createHmac("sha256", secret).update(message).digest("hex");
}

function verifyMessage(hmac, verifySignature) {
  return timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
}

export function POST(req: Request, res: NextApiResponse) {
  const secret = process.env.TWITCH_WEBHOOK_SECRET;
  const headers = Object.fromEntries(req.headers);
  const message =
    (headers["twitch-eventsub-message-id"],
    headers["twitch-eventsub-message-timestamp"],
    req.body);
  const hmac = "sha256=" + getHmac(secret, message);
  if (
    true != verifyMessage(hmac, headers["twitch-eventsub-message-signature"])
  ) {
    return new NextResponse(null, { status: 403 });
  }
  const requestType: string = headers["twitch-eventsub-message-type"];
  if (requestType == "webhook_callback_verification") {
    let notification = JSON.parse(req.body);
    return new NextResponse(notification.challenge, { status: 200 });
  }
  return new NextResponse(null, { status: 200 });
}
