import { redis } from "lib/redis";
import type { SongTypeInRedis } from "types/song";

const ADD_SONG_SONG_TTL_IN_SECOUNDS = 24 * 60 * 60;
async function addSongToRedis(
  broadcasterID: string,
  songID: string,
  song: SongTypeInRedis,
) {
  await redis.rPush(`songs:${broadcasterID}`, songID);
  const songObject: SongTypeInRedis = {
    title: song.title,
    songLengthSeconds: song.songLengthSeconds,
    songAuthor: song.songAuthor,
    songThumbnail: song.songThumbnail,
  };
  await redis.hSet(`song:${songID}`, songObject);
  await redis.expire(`song:${songID}`, ADD_SONG_SONG_TTL_IN_SECOUNDS);
}

export { addSongToRedis, ADD_SONG_SONG_TTL_IN_SECOUNDS };
