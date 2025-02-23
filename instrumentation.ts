import { redis } from "lib/redis";
import { twitchAssaignWebhookToConduit } from "~/utils/twitchAssignWebhookToConduit";

export async function register() {
  console.log(await redis.ping());
  console.error("uwu");
  await twitchAssaignWebhookToConduit();
}
