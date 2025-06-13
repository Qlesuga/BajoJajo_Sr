import { redis } from "lib/redis";
import type { SongQueueElementType, SongType } from "types/song";
import { getSong } from "./getSong";
import getRandomSongFromHistory from "./getRandomSongFromHistory";

async function getCurrentSong(broadcasterID: string): Promise<SongType | null> {
  const songEntry = await redis.lIndex(`songs:${broadcasterID}`, 0);
  if (!songEntry) {
    return await getRandomSongFromHistory(broadcasterID);
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
