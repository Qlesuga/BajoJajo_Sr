import { redis } from "lib/redis";
import { type SongTypeWithoutBlob } from "types/song";
import { getYouTubeInfo, type InfoApiResponse } from "../utilsYTDL";

export async function getSongInfo(
  songID: string,
): Promise<SongTypeWithoutBlob | null> {
  let song: Record<string, string> | null | InfoApiResponse =
    await redis.hGetAll(`song:${songID}`);
  if (!song) {
    song = await getYouTubeInfo(songID);
    if (!song) {
      return null;
    }
    return {
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
      title: title,
      songAuthor: songAuthor,
      songLengthSeconds: parseInt(songLengthSeconds),
      songThumbnail: songThumbnail,
    };
  }
}
