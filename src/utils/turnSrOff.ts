"server-only";

import { db } from "~/server/db";

export async function turnSrOff(broadcasterID: string): Promise<string | null> {
  const account = await db.account.findFirst({
    where: {
      providerAccountId: broadcasterID,
      provider: "twitch",
    },
  });
  if (!account) {
    return null;
  }
  db.srStatus
    .update({
      where: {
        userID: account.userId,
      },
      data: {
        status: false,
      },
    })
    .catch((e) => console.error(e));
  return "bip :(";
}
