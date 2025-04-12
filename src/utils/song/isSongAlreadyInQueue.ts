import { redis } from "lib/redis";
import { type SongQueueElementType } from "types/song";

async function isSongAlreadyInQueue(
  broadcasterID: string,
  lookedForSongID: string,
): Promise<boolean> {
  const songQueueEntries = await redis.lRange(`songs:${broadcasterID}`, 0, -1);

  const didFound = songQueueEntries.some((entry) => {
    const element = JSON.parse(entry) as SongQueueElementType;
    return element.songID == lookedForSongID;
  });

  return didFound;
}

export { isSongAlreadyInQueue };
