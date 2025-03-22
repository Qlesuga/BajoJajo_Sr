import { redis } from "lib/redis";
import { twitchAssaignWebhookToConduit } from "~/utils/twitch/twitchAssignWebhookToConduit";

export async function register() {
  console.log(await redis.ping());
  await twitchAssaignWebhookToConduit();
}
