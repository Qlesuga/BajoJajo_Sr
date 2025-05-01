import { whenNextSongByUsername } from "./song/whenNextSongByUsername";

const SONG_IS_CURRENTLY_PLAYING = "your song is currently playing";
const SONG_WILL_BE_PLAYED = (minutes: number, secounds: number) =>
  `your song will be played in around: ${minutes}min ${secounds}s`;
export default async function whenUserSong(
  broadcasterID: string,
  chaterUserName: string,
): Promise<string> {
  const time = await whenNextSongByUsername(broadcasterID, chaterUserName);
  const minutes = Math.floor(time / 60);
  const secounds = time - minutes * 60;
  if (secounds == 0) {
    return SONG_IS_CURRENTLY_PLAYING;
  }
  return SONG_WILL_BE_PLAYED(minutes, secounds);
}
