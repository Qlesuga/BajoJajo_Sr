import type { SongTypeWithoutBlob } from "types/song";
import { getSongInfo } from "./getSongInfo";
import { getCurrentSong } from "./getCurrentSongs";

async function getCurrentSongInfo(
  broadcasterID: string,
): Promise<SongTypeWithoutBlob | null> {
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
