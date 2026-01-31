import { redis } from "lib/redis";
import type { SongQueueElementType, SongTypeWithAddedBy } from "types/song";
import { getSong } from "./getSong";

async function getAllSongsWithoutBlob(
  broadcasterID: string,
): Promise<SongTypeWithAddedBy[]> {
  const songsEntries = await redis.lRange(`songs:${broadcasterID}`, 0, -1);

  const songs: (SongTypeWithAddedBy | null)[] = await Promise.all(
    songsEntries.map(async (entry) => {
      const songElement = JSON.parse(entry) as SongQueueElementType;
      const song = await getSong(songElement.songID);
      if (!song) {
        return null;
      }
      return {
        songID: songElement.songID,
        title: song.title,
        songAuthor: song.songAuthor,
        songLengthSeconds: song.songLengthSeconds,
        songThumbnail: song.songThumbnail,
        addedBy: songElement.addedBy,
      };
    }),
  );

  return songs.filter((song) => song !== null);
}

export { getAllSongsWithoutBlob };
