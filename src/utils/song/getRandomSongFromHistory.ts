import { SongType } from "types/song";
import { db } from "~/server/db";
import { getSong } from "./getSong";

async function getRandomSongIDFromHistory(
  broadcasterID: string,
): Promise<string | null> {
  const account = await db.account.findFirst({
    where: {
      provider: "twitch",
      providerAccountId: broadcasterID,
    },
  });

  if (!account) {
    return null;
  }

  const songHistoryCount = await db.userMusicHistory.count({
    where: {
      userID: account.userId,
    },
  });

  const randomIndex = Math.floor(Math.random() * songHistoryCount);

  const songHistory = await db.userMusicHistory.findFirst({
    where: {
      userID: account.userId,
    },
    skip: randomIndex,
  });

  return songHistory?.songID || null;
}

export default async function getRandomSongFromHistory(
  broadcasterID: string,
): Promise<SongType | null> {
  const songID = await getRandomSongIDFromHistory(broadcasterID);
  if (!songID) {
    return null;
  }
  const song = await getSong(songID);
  return song;
}
