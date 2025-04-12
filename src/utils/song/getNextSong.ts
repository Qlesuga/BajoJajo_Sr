import { redis } from "lib/redis";
import type { SongQueueElementType, SongType } from "types/song";
import { getSong } from "./getSong";

async function getNextSong(broadcasterID: string): Promise<SongType | null> {
  const songsEntry = await redis.lPop(`songs:${broadcasterID}`);
  if (songsEntry == null) {
    return null;
  }
  const songQueueElement: SongQueueElementType = JSON.parse(
    songsEntry,
  ) as SongQueueElementType;
  const song = await getSong(songQueueElement.songID);
  if (!song) {
    return null;
  }
  return song;
}

export { getNextSong };
