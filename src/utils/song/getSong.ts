import { redis } from "lib/redis";
import type { SongType } from "types/song";

async function getSong(songID: string): Promise<SongType | null> {
  const song = await redis.hGetAll(`song:${songID}`);
  if (!song) {
    return null;
  }
  const { title, songLengthSeconds, songAuthor, songThumbnail, songBlob } =
    song;
  if (
    !title ||
    !songLengthSeconds ||
    !songAuthor ||
    !songThumbnail ||
    !songBlob
  ) {
    return null;
  }
  return {
    title: title,
    songAuthor: songAuthor,
    songLengthSeconds: parseInt(songLengthSeconds),
    songThumbnail: songThumbnail,
    songBlob: songBlob,
  };
}

export { getSong };
