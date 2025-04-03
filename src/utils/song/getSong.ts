import { redis } from "lib/redis";
import type { SongTypeInRedis, SongType } from "types/song";
import { getYouTubeVideo } from "../utilsYTDL";

async function getSong(
  songID: string,
): Promise<(SongTypeInRedis & { songBlob: string }) | null> {
  const song = await redis.hGetAll(`song:${songID}`);
  if (!song) {
    return null;
  }
  const { title, songLengthSeconds, songAuthor, songThumbnail } = song;
  if (!title || !songLengthSeconds || !songAuthor || !songThumbnail) {
    return null;
  }
  const songFile = await getYouTubeVideo(songID);
  if (!songFile) {
    return null;
  }
  return {
    title: title,
    songAuthor: songAuthor,
    songLengthSeconds: parseInt(songLengthSeconds),
    songThumbnail: songThumbnail,
    songBlob: songFile,
  };
}

export { getSong };
