import { redis } from "lib/redis";
import type { SongQueueElementType, SongType } from "types/song";
import { getSong } from "./getSong";
import getRandomSongFromHistory from "./getRandomSongFromHistory";

async function getNextSong(broadcasterID: string): Promise<SongType | null> {
  const songsEntries = await redis.lRange(`songs:${broadcasterID}`, 1, 1);
  if (songsEntries.length < 1) {
    const randomSong = await getRandomSongFromHistory(broadcasterID);
    return randomSong;
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

export { getNextSong };
