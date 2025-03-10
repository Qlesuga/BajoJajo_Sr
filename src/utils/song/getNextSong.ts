import { redis } from "lib/redis";
import type { SongType } from "types/song";

async function getNextSong(broadcasterID: string): Promise<SongType | null> {
  const songID = await redis.lPop(`songs:${broadcasterID}`);
  if (songID == null) {
    return null;
  }
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

export { getNextSong };
