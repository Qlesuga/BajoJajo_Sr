import { redis } from "lib/redis";
import type { SongTypeWithoutBlob } from "types/song";
import { getSong } from "./getSong";

async function getAllSongsWithoutBlob(
  broadcasterID: string,
): Promise<SongTypeWithoutBlob[]> {
  const songsID = await redis.lRange(`songs:${broadcasterID}`, 0, -1);

  const songs: (SongTypeWithoutBlob | null)[] = await Promise.all(
    songsID.map(async (songID) => {
      const song = await getSong(songID);
      if (!song) {
        return null;
      }
      return {
        title: song.title,
        songAuthor: song.songAuthor,
        songLengthSeconds: song.songLengthSeconds,
        songThumbnail: song.songThumbnail,
      };
    }),
  );

  return songs.filter((song) => song !== null);
}

export { getAllSongsWithoutBlob };
