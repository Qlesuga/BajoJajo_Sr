import { auth } from "~/server/auth";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "~/server/db";
import { redis } from "lib/redis";
import { readdir } from "fs";

const models = [
  db.userMusicHistory,
  db.userSongRequestSettings,
  db.userPlayerSettings,
  db.srStatus,
  db.account,
  db.user,
  db.session,
  db.verificationToken,
  db.userPlayerLink,
];

export const admingRouter = createTRPCRouter({
  getOverviewData: publicProcedure.query(async () => {
    const session = await auth();
    const isAdmin = session?.account.providerId === process.env.ADMIN_TWITCH_ID;
    if (!isAdmin) {
      return null;
    }
    const usersCount = await db.user.count();

    let postgresRowCount = 0;
    for (const model of models) {
      // @ts-ignore
      postgresRowCount += await model.count();
    }

    const redisKeys = await redis.keys("*");

    const pathToDirectory = "/music";
    const filesCount = await new Promise((resolve, reject) => {
      readdir(pathToDirectory, (error, files) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(files.length);
        }
      });
    });

    return {
      usersCount,
      postgresRowCount,
      redisKeys: redisKeys.length,
      filesCount,
    };
  }),
  getRedisKeys: publicProcedure.query(async () => {
    const session = await auth();
    const isAdmin = session?.account.providerId === process.env.ADMIN_TWITCH_ID;
    if (!isAdmin) {
      return null;
    }
    const keys = await redis.keys("*");
    const keyDetails = await Promise.all(
      keys.map(async (key) => {
        const type = await redis.type(key);
        let value;
        if (type === "string") {
          value = await redis.get(key);
        } else if (type === "hash") {
          value = await redis.hGetAll(key);
        } else if (type === "list") {
          value = await redis.lRange(key, 0, -1);
        }
        const ttl = await redis.ttl(key);
        return { key, type, ttl, value };
      }),
    );
    return keyDetails;
  }),
});
