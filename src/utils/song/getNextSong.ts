import { redis } from "lib/redis";
import { type SongType } from "types/song";

async function getNextSong(broadcasterID: string): Promise<SongType | null> {
  const songID = await redis.lPop(`songs:${broadcasterID}`);
  if (songID == null) {
    return null;
  }
  const song = await redis.hGetAll(`song:${songID}`);
  if (!song) {
    return null;
  }
  const { title, lengthSeconds, ownerChannelName, thumbnail, blob } = song;
  if (!title || !lengthSeconds || !ownerChannelName || !thumbnail || !blob) {
    return null;
  }
  return {
    title: title,
    songAuthor: ownerChannelName,
    songLengthSeconds: parseInt(lengthSeconds),
    songThumbnail: thumbnail,
    songBlob: blob,
  };
}

export { getNextSong };
