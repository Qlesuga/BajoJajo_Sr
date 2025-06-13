import { redis } from "lib/redis";
import { type SongTypeInRedis, type SongTypeWithoutBlob } from "types/song";
import { getYouTubeInfo, type InfoApiResponse } from "../utilsYTDL";

export async function getSongInfo(
  songID: string,
): Promise<SongTypeWithoutBlob | null> {
  let song: Record<string, string> | null | InfoApiResponse =
    await redis.hGetAll(`song:${songID}`);

  if (!song?.title) {
    song = await getYouTubeInfo(songID);
    if (!song) {
      return null;
    }

    const songObject: SongTypeInRedis = {
      title: song.title,
      songLengthSeconds: song.videoLength,
      songAuthor: song.channel,
      songThumbnail: song.thumbnail,
    };

    await redis.hSet(`song:${songID}`, songObject);
    return {
      songID: songID,
      title: song.title,
      songAuthor: song.channel,
      songLengthSeconds: song.videoLength,
      songThumbnail: song.thumbnail,
    };
  } else {
    const { title, songLengthSeconds, songAuthor, songThumbnail } = song;
    if (!title || !songLengthSeconds || !songAuthor || !songThumbnail) {
      return null;
    }
    return {
      songID: songID,
      title: title,
      songAuthor: songAuthor,
      songLengthSeconds: parseInt(songLengthSeconds),
      songThumbnail: songThumbnail,
    };
  }
}
