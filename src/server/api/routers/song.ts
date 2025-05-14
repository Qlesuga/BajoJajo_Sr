import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { EventEmitter, on } from "stream";
import { z } from "zod";
import { containsBannedString } from "~/utils/twitch/twitchBannedRegex";
import { addSongToRedis } from "~/utils/song/addSongToRedis";
import type { SongQueueElementType, SongTypeWithoutBlob } from "types/song";
import { getNextSong } from "~/utils/song/getNextSong";
import { getUserFromUserLink } from "~/utils/getUserFromUserLink";
import { getYouTubeInfo, getYouTubeVideo } from "~/utils/utilsYTDL";
import { getAllSongsWithoutBlob } from "~/utils/song/getAllSongsWithoutBlob";
import { isSongAlreadyInQueue } from "~/utils/song/isSongAlreadyInQueue";
import {
  emitToSubscriptedUser,
  getSubscriptedUsers,
} from "lib/subscriptedUsers/subscripedUsers";
import { type AvailableEmits } from "types/subscriptedUsers";
import { getUserPlayerSettings } from "~/utils/getUserPlayerSettings";
import { getCurrentSong } from "~/utils/song/getCurrentSongs";
import { redis } from "lib/redis";
import { twitchSendChatMessage } from "~/utils/twitch/twitchSendChatMessage";
import { auth } from "~/server/auth";
import { TRPCError } from "@trpc/server";

export const songRouter = createTRPCRouter({
  getCurrentSong: publicProcedure.input(z.string()).query(async (opts) => {
    const userLink = opts.input;

    const broadcasterID = await getUserFromUserLink(userLink);
    if (!broadcasterID) {
      return null;
    }

    return await getCurrentSong(broadcasterID);
  }),
  getNextSong: publicProcedure.input(z.string()).query(async (opts) => {
    const userLink = opts.input;

    const broadcasterID = await getUserFromUserLink(userLink);
    if (!broadcasterID) {
      return null;
    }

    return await getNextSong(broadcasterID);
  }),
  getNextSongAndCompleteCurrent: publicProcedure
    .input(z.string())
    .query(async (opts) => {
      const userLink = opts.input;

      const broadcasterID = await getUserFromUserLink(userLink);
      if (!broadcasterID) {
        return null;
      }
      const songElement = await redis.lPop(`songs:${broadcasterID}`);
      if (process.env.NODE_ENV == "development" && songElement) {
        const song = JSON.parse(songElement) as SongQueueElementType;
        await addSongToUser(broadcasterID, song.songID, song.addedBy);
      }
      return await getNextSong(broadcasterID);
    }),

  removeSongFromQueue: publicProcedure
    .input(
      z.object({
        songID: z.string(),
        songIndex: z.number(),
      }),
    )
    .mutation(async (opts) => {
      // TODO add handling deleting first and secound index with skip
      const { songID } = opts.input;
      const songIndex = opts.input.songIndex;
      const session = await auth();
      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "you are not logged in",
        });
      }
      const key = `songs:${session.account.providerId}`;
      for (let i = 0; i < 3 && songIndex >= 0; i++) {
        const rawSong = await redis.lIndex(key, songIndex - i);
        if (!rawSong) {
          continue;
        }
        const song = JSON.parse(rawSong) as SongQueueElementType;
        if (song.songID == songID) {
          await redis.lRem(key, 1, rawSong);
          return "successfully removed song";
        }
      }
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "could not find song",
      });
    }),

  getPlayerSettings: publicProcedure.input(z.string()).query(async (opts) => {
    const userLink = opts.input;

    const broadcasterID = await getUserFromUserLink(userLink);
    if (!broadcasterID) {
      return null;
    }

    return await getUserPlayerSettings(broadcasterID);
  }),

  getAllSongs: publicProcedure.input(z.string()).query(async (opts) => {
    return await getAllSongsWithoutBlob(opts.input);
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
      for await (const data of on(emitter, "emit", {
        signal: opts.signal,
      })) {
        yield data[0] as AvailableEmits;
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
  addedBy: string,
  messageIDToResponse: string | null = null,
): Promise<string | null> {
  if (url == "") {
    return ADD_SONG_INVALID_SONG;
  }
  const allCurrentSongs = await getAllSongsWithoutBlob(broadcasterID);
  if (allCurrentSongs.length > QUEUE_LENGTH_LIMIT) {
    return MAX_LENGTH_REACHED;
  }

  const videoInfo = await getYouTubeInfo(url);
  console.log("info");
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
  if (messageIDToResponse) {
    await twitchSendChatMessage(
      broadcasterID,
      ADD_SONG_SUCCESS_MESSAGE(title),
      messageIDToResponse,
    );
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
  await addSongToRedis(broadcasterID, songID, song, addedBy);

  emitToSubscriptedUser(broadcasterID, {
    type: "new_song",
  });
  return null;
}
