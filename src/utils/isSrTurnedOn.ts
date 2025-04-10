"server-only";

import { db } from "~/server/db";

export async function isSrTurnedOn(broadcasterID: string): Promise<boolean> {
  const account = await db.account.findFirst({
    where: {
      providerAccountId: broadcasterID,
      provider: "twitch",
    },
  });
  if (!account) {
    return false;
  }
  const status = await db.srStatus.findFirst({
    where: {
      userID: account.userId,
    },
  });
  if (!status) {
    db.srStatus
      .create({
        data: {
          userID: account.userId,
        },
      })
      .catch((e) => console.error(e));
    return true;
  }
  return status.status;
}
