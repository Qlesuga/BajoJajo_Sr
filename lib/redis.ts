import { createClient, type RedisClientType } from "redis";

const client: RedisClientType = createClient({
  password: process.env.REDIS_PASSWORD,
});
client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();

process.on("SIGINT", () => {
  void (async () => await client.disconnect())();
});

process.on("SIGTERM", () => {
  void (async () => await client.disconnect())();
});

export { client as redis };
