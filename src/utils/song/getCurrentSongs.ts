import { redis } from "lib/redis";
import type { SongQueueElementType, SongType } from "types/song";
import { getSong } from "./getSong";

async function getCurrentSong(broadcasterID: string): Promise<SongType | null> {
  const songsEntries = await redis.lRange(`songs:${broadcasterID}`, 0, 0);
  if (songsEntries.length < 1) {
    return null;
  }
  const songEntry = songsEntries[0];
  if (!songEntry) {
    return null;
  }
  const songQueueElement: SongQueueElementType = JSON.parse(
    songEntry,
  ) as SongQueueElementType;
  const song = await getSong(songQueueElement.songID);
  if (!song) {
    return null;
  }
  return song;
}

export { getCurrentSong };
