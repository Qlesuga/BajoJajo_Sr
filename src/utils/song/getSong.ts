import type { SongType } from "types/song";
import { getSongInfo } from "./getSongInfo";

async function getSong(songID: string): Promise<SongType | null> {
  const songInfo = await getSongInfo(songID);
  if (!songInfo) {
    return null;
  }

  return {
    songID: songID,
    title: songInfo.title,
    songAuthor: songInfo.songAuthor,
    songLengthSeconds: songInfo.songLengthSeconds,
    songThumbnail: songInfo.songThumbnail,
  };
}

export { getSong };
