import type { SongTypeInRedis } from "types/song";
import { getYouTubeVideo } from "../utilsYTDL";
import { getSongInfo } from "./getSongInfo";

async function getSong(
  songID: string,
): Promise<(SongTypeInRedis & { songBlob: string }) | null> {
  const songInfo = await getSongInfo(songID);
  if (!songInfo) {
    return null;
  }
  const songFile = await getYouTubeVideo(songID);
  if (!songFile) {
    return null;
  }
  return {
    title: songInfo.title,
    songAuthor: songInfo.songAuthor,
    songLengthSeconds: songInfo.songLengthSeconds,
    songThumbnail: songInfo.songThumbnail,
    songBlob: songFile,
  };
}

export { getSong };
