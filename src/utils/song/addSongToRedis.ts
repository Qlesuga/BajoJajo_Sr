import { redis } from "lib/redis";
import type { SongType } from "types/song";

const ADD_SONG_SONG_TTL_IN_SECOUNDS = 60 * 60;
async function addSongToRedis(
  broadcasterID: string,
  songID: string,
  song: SongType,
) {
  await redis.rPush(`songs:${broadcasterID}`, songID);
  const songObject: SongType = {
    title: song.title,
    songLengthSeconds: song.songLengthSeconds,
    songAuthor: song.songAuthor,
    songThumbnail: song.songThumbnail,
    songBlob: song.songBlob,
  };
  await redis.hSet(`song:${songID}`, songObject);
  await redis.expire(`song:${songID}`, ADD_SONG_SONG_TTL_IN_SECOUNDS);
}

export { addSongToRedis, ADD_SONG_SONG_TTL_IN_SECOUNDS };
