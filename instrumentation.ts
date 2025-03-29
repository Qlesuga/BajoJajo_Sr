import { redis } from "lib/redis";
import { twitchAssaignWebhookToConduit } from "~/utils/twitch/twitchAssignWebhookToConduit";

export async function register() {
  console.log("redis test: ");
  console.log(await redis.ping());
  console.log("assaign webhook endpoint to conduit: ");
  await twitchAssaignWebhookToConduit();
}
