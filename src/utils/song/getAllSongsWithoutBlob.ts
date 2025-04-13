import { redis } from "lib/redis";
import type { SongQueueElementType, SongTypeWithoutBlob } from "types/song";
import { getSong } from "./getSong";

type allSongInfo = SongTypeWithoutBlob & { addedBy: string; songID: string };

async function getAllSongsWithoutBlob(
  broadcasterID: string,
): Promise<allSongInfo[]> {
  const songsEntries = await redis.lRange(`songs:${broadcasterID}`, 0, -1);

  const songs: (allSongInfo | null)[] = await Promise.all(
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
