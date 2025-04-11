import { db } from "~/server/db";

export async function setUserVolumeSetting(
  broadcasterID: string,
  volume: number,
): Promise<null> {
  const account = await db.account.findFirst({
    where: {
      providerAccountId: broadcasterID,
      provider: "twitch",
    },
  });
  if (!account) {
    return null;
  }
  await db.userPlayerSettings.update({
    where: {
      userID: account?.userId,
    },
    data: {
      volumeInPercentage: volume,
    },
  });
  return null;
}
