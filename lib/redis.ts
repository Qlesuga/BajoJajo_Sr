import { createClient, type RedisClientType } from "redis";

const client: RedisClientType = createClient({
  socket: {
    host: process.env.REDIS_HOST,
  },
  password: process.env.REDIS_PASSWORD,
});
client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();

export { client as redis };
