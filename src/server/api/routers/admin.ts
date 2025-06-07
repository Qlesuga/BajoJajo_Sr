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

    console.log("Files count:", filesCount);
    return {
      usersCount,
      postgresRowCount,
      redisKeys: redisKeys.length,
      filesCount,
    };
  }),
});
