import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { EventEmitter, on } from "stream";
import { z } from "zod";
import { containsBannedString } from "~/utils/twitch/twitchBannedRegex";
import { addSongToRedis } from "~/utils/song/addSongToRedis";
import type { SongTypeWithoutBlob } from "types/song";
import { getNextSong } from "~/utils/song/getNextSong";
import { getUserFromUserLink } from "~/utils/getUserFromUserLink";
import { getYouTubeInfo, getYouTubeVideo } from "~/utils/utilsYTDL";
import { getAllSongsWithoutBlob } from "~/utils/song/getAllSongsWithoutBlob";
import { isSongAlreadyInQueue } from "~/utils/song/isSongAlreadyInQueue";
import { getSubscriptedUsers } from "./subscripedUsers";

export const songRouter = createTRPCRouter({
  nextSong: publicProcedure.input(z.string()).query(async (opts) => {
    const userLink = opts.input;

    const broadcasterID = await getUserFromUserLink(userLink);
    if (!broadcasterID) {
      return null;
    }

    return await getNextSong(broadcasterID);
  }),

  songSubscription: publicProcedure
    .input(z.string())
    .subscription(async function* (opts) {
      const userLink = opts.input;

      const broadcasterID = await getUserFromUserLink(userLink);
      if (!broadcasterID) {
        return;
      }

      let emitter: EventEmitter;
      const users = getSubscriptedUsers();
      if (broadcasterID in users) {
        emitter = users[broadcasterID]!.eventEmitter;
      } else {
        emitter = new EventEmitter();
        users[broadcasterID] = {
          eventEmitter: emitter,
        };
      }
      console.log(getSubscriptedUsers());
      for await (const data of on(emitter, "emit", {
        signal: opts.signal,
      })) {
        console.log(data);
        yield data[0] as { type: string; value: number | null };
      }
    }),
});

const ADD_SONG_SUCCESS_MESSAGE = (title: string) =>
  `successfully added "${title}" to queue`;
const ADD_SONG_ALREADY_IN_QUEUE = "already in queue";
const ADD_SONG_BANNED_WORD_IN_TITLE = "song contains banned word in title";
const MINIMUM_VIDEO_LENGTH = 30;
const MAXIMUM_VIDEO_LENGTH = 60 * 5;
const ADD_SONG_WRONG_LENGTH = `song length must be between ${MINIMUM_VIDEO_LENGTH}s and ${MAXIMUM_VIDEO_LENGTH / 60}min`;
const MINIMUM_VIDEO_VIEWS = 7000;
const ADD_SONG_MINIMUM_VIEWS = `song must have over ${MINIMUM_VIDEO_VIEWS} views`;
const ADD_SONG_VIDEO_AGE_RESTRICTED = "song is age restricted";
const ADD_SONG_INVALID_SONG = "invalid song";
const QUEUE_LENGTH_LIMIT = 20;
const MAX_LENGTH_REACHED = `song queue length can't exceed ${QUEUE_LENGTH_LIMIT}`;
export async function addSongToUser(
  broadcasterID: string,
  url: string,
): Promise<string> {
  if (url == "") {
    return ADD_SONG_INVALID_SONG;
  }
  const allCurrentSongs = await getAllSongsWithoutBlob(broadcasterID);
  if (allCurrentSongs.length > QUEUE_LENGTH_LIMIT) {
    return MAX_LENGTH_REACHED;
  }

  const videoInfo = await getYouTubeInfo(url);
  if (videoInfo == null) {
    return ADD_SONG_INVALID_SONG;
  }

  const songID = videoInfo.id;
  const title: string = videoInfo.title;
  const videoLength: number = videoInfo.videoLength;
  const videoViews: number = videoInfo.videosViews;
  const isAgeRestricted: boolean = videoInfo.isAgeRestricted;

  const isAlreadyInQueue = await isSongAlreadyInQueue(broadcasterID, songID);
  if (isAlreadyInQueue) {
    return ADD_SONG_ALREADY_IN_QUEUE;
  }

  if (containsBannedString(title)) {
    return ADD_SONG_BANNED_WORD_IN_TITLE;
  }

  if (
    !(videoLength > MINIMUM_VIDEO_LENGTH && videoLength < MAXIMUM_VIDEO_LENGTH)
  ) {
    return ADD_SONG_WRONG_LENGTH;
  }
  if (videoViews < MINIMUM_VIDEO_VIEWS) {
    return ADD_SONG_MINIMUM_VIEWS;
  }
  if (isAgeRestricted) {
    return ADD_SONG_VIDEO_AGE_RESTRICTED;
  }

  const VideoFile: string | null = await getYouTubeVideo(songID);
  if (!VideoFile) {
    return ADD_SONG_INVALID_SONG;
  }
  const song: SongTypeWithoutBlob = {
    title: title,
    songLengthSeconds: videoLength,
    songAuthor: videoInfo.channel,
    songThumbnail: videoInfo.thumbnail,
  };
  await addSongToRedis(broadcasterID, songID, song);

  getSubscriptedUsers()[broadcasterID]?.eventEmitter.emit("emit", {
    type: "new_song",
  });
  return ADD_SONG_SUCCESS_MESSAGE(title);
}

const SKIP_SONG_SUCCESS_MESSAGE = "successfully skiped a song";
export function skipSong(userID: string): string {
  getSubscriptedUsers()[userID]?.eventEmitter.emit("emit", { type: "skip" });
  return SKIP_SONG_SUCCESS_MESSAGE;
}

export function stopSong(userID: string): null {
  getSubscriptedUsers()[userID]?.eventEmitter.emit("emit", { type: "stop" });
  return null;
}

export function playSong(userID: string): null {
  getSubscriptedUsers()[userID]?.eventEmitter.emit("emit", { type: "play" });
  return null;
}

const SET_VOLUME_ERROR_MESSAGE = "volume must be a number between 0 and 100";
const SET_VOLUME_SUCCESS_MESSAGE = "volume got set to:";
export function setVolume(userID: string, value: string): string {
  const volume = parseInt(value);

  if (isNaN(volume) || volume > 100 || volume < 0) {
    return SET_VOLUME_ERROR_MESSAGE;
  }
  getSubscriptedUsers()[userID]?.eventEmitter.emit("emit", {
    type: "volume",
    value: Math.floor(volume) / 100,
  });
  return `${SET_VOLUME_SUCCESS_MESSAGE} ${volume}%`;
}
