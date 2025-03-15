import { redis } from "lib/redis";
import type { ISong } from "types/song";
import { getSong } from "./getSong";

async function getNextSong(broadcasterID: string): Promise<ISong | null> {
  const songID = await redis.lPop(`songs:${broadcasterID}`);
  if (songID == null) {
    return null;
  }
  const song = await getSong(songID);
  if (!song) {
    return null;
  }
  return song;
}

export { getNextSong };
