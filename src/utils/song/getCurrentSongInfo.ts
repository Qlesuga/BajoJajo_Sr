import { redis } from "lib/redis";
import type { SongTypeWithoutBlob } from "types/song";
import { getSongInfo } from "./getSongInfo";

async function getCurrentSongInfo(
  broadcasterID: string,
): Promise<SongTypeWithoutBlob | null> {
  const songs: string[] | null = await redis.lRange(
    `songs:${broadcasterID}`,
    0,
    0,
  );
  const songID: string | undefined = songs[0];
  if (songID == null) {
    return null;
  }
  const song = await getSongInfo(songID);
  if (!song) {
    return null;
  }
  return song;
}

export { getCurrentSongInfo };
