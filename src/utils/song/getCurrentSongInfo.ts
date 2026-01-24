import type { SongType } from "types/song";
import { getSongInfo } from "./getSongInfo";
import { getCurrentSong } from "./getCurrentSongs";

async function getCurrentSongInfo(
  broadcasterID: string,
): Promise<SongType | null> {
  const song = await getCurrentSong(broadcasterID);
  if (!song) {
    return null;
  }

  const songInfo = await getSongInfo(song.songID);
  if (!songInfo) {
    return null;
  }

  return songInfo;
}

export { getCurrentSongInfo };
