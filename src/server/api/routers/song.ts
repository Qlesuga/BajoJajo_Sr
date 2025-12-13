import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { EventEmitter, on } from "stream";
import { z } from "zod";
import { containsBannedString } from "~/utils/twitch/twitchBannedRegex";
import { addSongToRedis } from "~/utils/song/addSongToRedis";
import type { SongQueueElementType, SongTypeWithoutBlob } from "types/song";
import { getNextSong } from "~/utils/song/getNextSong";
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
import { skipSong } from "lib/subscriptedUsers/songHandling";
import { db } from "~/server/db";

export const songRouter = createTRPCRouter({
  getCurrentSong: publicProcedure.query(async () => {
    const session = await auth();
    if (!session) {
      return null;
    }

    return await getCurrentSong(session.account.providerId);
  }),

  getNextSong: publicProcedure.query(async () => {
    const session = await auth();
    if (!session) {
      return null;
    }

    return await getNextSong(session.account.providerId);
  }),
  getNextSongAndCompleteCurrent: publicProcedure
    .input(
      z.object({
        songID: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { songID } = input;

      const session = await auth();
      if (!session) {
        return null;
      }
      const broadcasterID = session.account.providerId;

      const firstSong = await getCurrentSong(broadcasterID);

      if (firstSong?.songID === songID) {
        await redis.lPop(`songs:${broadcasterID}`);
        if (process.env.NODE_ENV == "development") {
          console.log("SONGID", songID);
          addSongToUser(broadcasterID, songID || "", "loop").catch((e) =>
            console.error(e),
          );
        }
        return await getNextSong(broadcasterID);
      }

      return firstSong;
    }),

  removeSongFromQueue: publicProcedure
    .input(
      z.object({
        songID: z.string(),
        songIndex: z.number(),
      }),
    )
    .mutation(async (opts) => {
      // TODO add handling deleting secound index with skip
      // TODO add removing songs by mods
      const { songID } = opts.input;
      const songIndex = opts.input.songIndex;
      const session = await auth();
      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "you are not logged in",
        });
      }
      const providerID = session.account.providerId;
      const key = `songs:${providerID}`;
      for (let i = 0; i < 3 && songIndex >= 0; i++) {
        const rawSong = await redis.lIndex(key, songIndex - i);
        if (!rawSong) {
          continue;
        }
        const song = JSON.parse(rawSong) as SongQueueElementType;
        if (song.songID == songID) {
          await redis.lRem(key, 1, rawSong);
          if (songIndex == 0) {
            skipSong(providerID);
          }
          return "successfully removed song";
        }
      }
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "could not find song",
      });
    }),

  getPlayerSettings: publicProcedure.query(async () => {
    const session = await auth();
    if (!session) {
      return null;
    }
    const broadcasterID = session.account.providerId;

    return await getUserPlayerSettings(broadcasterID);
  }),

  getAllSongs: publicProcedure.input(z.string()).query(async (opts) => {
    return await getAllSongsWithoutBlob(opts.input);
  }),
  getAllMySongs: publicProcedure.query(async () => {
    const session = await auth();
    if (!session) {
      return;
    }
    const broadcasterID = session.account.providerId;
    return await getAllSongsWithoutBlob(broadcasterID);
  }),

  songSubscription: publicProcedure.subscription(async function* (opts) {
    const session = await auth();
    if (!session) {
      return;
    }
    const broadcasterID = session.account.providerId;

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
const MAXIMUM_VIDEO_LENGTH = 60 * 9;
const BLOCK_AGE_RESTRICTED_VIDEOS = false;
const ADD_SONG_WRONG_LENGTH = `song length must be between ${MINIMUM_VIDEO_LENGTH}s and ${MAXIMUM_VIDEO_LENGTH / 60}min`;
const MINIMUM_VIDEO_VIEWS = 2000;
const ADD_SONG_MINIMUM_VIEWS = `song must have over ${MINIMUM_VIDEO_VIEWS} views`;
const ADD_SONG_VIDEO_AGE_RESTRICTED = "song is age restricted";
const ADD_SONG_INVALID_SONG = "invalid song";
const QUEUE_LENGTH_LIMIT = 80;
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
  if (allCurrentSongs.length >= QUEUE_LENGTH_LIMIT) {
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
  if (BLOCK_AGE_RESTRICTED_VIDEOS && isAgeRestricted) {
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
    songID: songID,
    title: title,
    songLengthSeconds: videoLength,
    songAuthor: videoInfo.channel,
    songThumbnail: videoInfo.thumbnail,
  };

  const account = await db.account.findFirst({
    where: {
      provider: "twitch",
      providerAccountId: broadcasterID,
    },
  });
  if (!account) {
    return "User ID not found";
  }

  db.userMusicHistory
    .upsert({
      where: {
        userID: account.userId,
        songID: songID,
      },
      update: {},
      create: {
        userID: account.userId,
        songID: songID,
      },
    })
    .catch((err) => {
      console.error("Error creating user music history:", err);
    });

  await addSongToRedis(broadcasterID, songID, song, addedBy);

  emitToSubscriptedUser(broadcasterID, {
    type: "new_song",
  });
  return null;
}

export async function forceAddSongToUser(
  broadcasterID: string,
  url: string,
  addedBy: string,
  messageIDToResponse: string | null = null,
): Promise<string | null> {
  if (url == "") {
    return ADD_SONG_INVALID_SONG;
  }

  const videoInfo = await getYouTubeInfo(url);
  console.log("info");
  if (videoInfo == null) {
    return ADD_SONG_INVALID_SONG;
  }

  const songID = videoInfo.id;
  const title: string = videoInfo.title;
  const videoLength: number = videoInfo.videoLength;

  if (containsBannedString(title)) {
    return ADD_SONG_BANNED_WORD_IN_TITLE;
  }

  if (messageIDToResponse) {
    await twitchSendChatMessage(
      broadcasterID,
      "Successfully added song to queue",
      messageIDToResponse,
    );
  }

  const VideoFile: string | null = await getYouTubeVideo(songID);
  if (!VideoFile) {
    return ADD_SONG_INVALID_SONG;
  }
  const song: SongTypeWithoutBlob = {
    songID: songID,
    title: title,
    songLengthSeconds: videoLength,
    songAuthor: videoInfo.channel,
    songThumbnail: videoInfo.thumbnail,
  };

  const account = await db.account.findFirst({
    where: {
      provider: "twitch",
      providerAccountId: broadcasterID,
    },
  });
  if (!account) {
    return "User ID not found";
  }

  db.userMusicHistory
    .upsert({
      where: {
        userID: account.userId,
        songID: songID,
      },
      update: {},
      create: {
        userID: account.userId,
        songID: songID,
      },
    })
    .catch((err) => {
      console.error("Error creating user music history:", err);
    });

  await addSongToRedis(broadcasterID, songID, song, addedBy);

  emitToSubscriptedUser(broadcasterID, {
    type: "new_song",
  });

  return null;
}
