import { getAllSongsWithoutBlob } from "./getAllSongsWithoutBlob";

export async function whenNextSongByUsername(
  broadcasterID: string,
  username: string,
) {
  const allSongs = await getAllSongsWithoutBlob(broadcasterID);
  let sum = 0;
  allSongs.find((song) => {
    if (song.addedBy == username) {
      return true;
    }
    sum += song.songLengthSeconds;
  });
  return sum;
}
