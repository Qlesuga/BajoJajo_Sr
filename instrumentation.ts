import { redis } from "lib/redis";
import { DiskCache } from "~/utils/cache";
import { twitchAssaignWebhookToConduit } from "~/utils/twitchAssignWebhookToConduit";

export async function register() {
  console.log(await redis.ping());
  console.error("uwu");
  await DiskCache.initializeCache();
  await twitchAssaignWebhookToConduit();
}
