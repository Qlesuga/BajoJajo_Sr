"server-only";

import { type UserPlayerSettings } from "@prisma/client";
import { db } from "~/server/db";

export async function getUserPlayerSettings(
  broadcasterID: string,
): Promise<UserPlayerSettings | null> {
  const account = await db.account.findFirst({
    where: {
      providerAccountId: broadcasterID,
      provider: "twitch",
    },
  });
  if (!account) {
    return null;
  }
  const settings = await db.userPlayerSettings.findFirst({
    where: {
      userID: account.userId,
    },
  });
  if (!settings) {
    const created_settings = db.userPlayerSettings.create({
      data: {
        userID: account.userId,
      },
    });
    return created_settings;
  }
  return settings;
}
