"server-only";

import { db } from "~/server/db";

export async function turnSrOn(broadcasterID: string): Promise<string | null> {
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
        status: true,
      },
    })
    .catch((e) => console.error(e));
  return "boop :)";
}
