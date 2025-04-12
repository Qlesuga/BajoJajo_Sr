import { redis } from "lib/redis";
import type { SongQueueElementType, SongTypeInRedis } from "types/song";

const ADD_SONG_SONG_TTL_IN_SECOUNDS = 24 * 60 * 60;
async function addSongToRedis(
  broadcasterID: string,
  songID: string,
  song: SongTypeInRedis,
  addedBy: string,
) {
  const queueElement: SongQueueElementType = {
    songID: songID,
    addedBy: addedBy,
  };
  await redis.rPush(`songs:${broadcasterID}`, JSON.stringify(queueElement));
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
