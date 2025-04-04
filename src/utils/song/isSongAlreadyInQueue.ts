import { redis } from "lib/redis";

async function isSongAlreadyInQueue(
  broadcasterID: string,
  lookedForSongID: string,
): Promise<boolean> {
  const songsID = await redis.lRange(`songs:${broadcasterID}`, 0, -1);

  const didFound = songsID.some((song) => {
    return song == lookedForSongID;
  });

  return didFound;
}

export { isSongAlreadyInQueue };
