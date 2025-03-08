import ytdl from "@distube/ytdl-core";
import type { videoInfo as IVideoInfo, videoInfo } from "@distube/ytdl-core";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { EventEmitter, on } from "stream";
import { z } from "zod";
import { db } from "~/server/db";
import { user } from "@heroui/react";
import { containsBannedString } from "~/utils/twitchBannedRegex";

interface ISong {
  url: string;
  videoInfo: IVideoInfo;
  blob: string;
  status: "playing" | "pending";
}

interface ISubscriptedUser {
  eventEmitter: EventEmitter;
  songs: ISong[];
}

const subscripedUsers: Record<string, ISubscriptedUser> = {};

export const songRouter = createTRPCRouter({
  nextSong: publicProcedure.input(z.string()).query(async (opts) => {
    if (process.env.NODE_ENV == "development") {
      console.log(subscripedUsers);
    }
    const userLink = opts.input;

    const findUserFromLink = await db.userPlayerLink.findFirst({
      select: {
        user: {
          select: {
            accounts: {
              select: {
                providerAccountId: true,
              },
            },
          },
        },
      },
      where: {
        link: userLink,
      },
    });
    if (!findUserFromLink) {
      return null;
    }
    if (findUserFromLink.user.accounts.length == 0) {
      return null;
    }
    const userID = findUserFromLink.user.accounts[0]!.providerAccountId;
    console.log(userID);
    console.log("SONG REQUESTED");
    if (!(userID in subscripedUsers)) {
      const emitter = new EventEmitter();
      subscripedUsers[userID] = {
        eventEmitter: emitter,
        songs: [],
      };
    }
    const songs = subscripedUsers[userID]!.songs;
    if (songs.length == 0) {
      return null;
    }
    if (songs[0]!.status == "playing") {
      songs.shift();
      if (songs.length == 0) {
        return null;
      }
    }
    const song = songs[0];
    const { videoDetails } = song!.videoInfo;
    const { title, lengthSeconds, ownerChannelName, thumbnails } = videoDetails;
    song!.status = "playing";

    return {
      songTitle: title,
      songAuthor: ownerChannelName,
      songLength: parseInt(lengthSeconds),
      songThumbnail: thumbnails[1] ? thumbnails[1].url : "",
      songBlob: song!.blob,
    };
  }),

  songSubscription: publicProcedure
    .input(z.string())
    .subscription(async function* (opts) {
      const userLink = opts.input;

      const findUserFromLink = await db.userPlayerLink.findFirst({
        select: {
          user: {
            select: {
              accounts: {
                select: {
                  providerAccountId: true,
                },
              },
            },
          },
        },
        where: {
          link: userLink,
        },
      });
      if (!findUserFromLink || findUserFromLink.user.accounts.length == 0) {
        return;
      }
      const userID = findUserFromLink.user.accounts[0]!.providerAccountId;

      let emitter: EventEmitter;
      if (userID in subscripedUsers) {
        emitter = subscripedUsers[userID]!.eventEmitter;
      } else {
        emitter = new EventEmitter();
        subscripedUsers[userID] = {
          eventEmitter: emitter,
          songs: [],
        };
      }
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
export async function addSongToUser(
  userID: string,
  url: string,
): Promise<string> {
  if (url == "") {
    return ADD_SONG_INVALID_SONG;
  }
  if (!(userID in subscripedUsers)) {
    const emitter = new EventEmitter();
    subscripedUsers[userID] = {
      eventEmitter: emitter,
      songs: [],
    };
  }
  if (process.env.NODE_ENV != "development") {
    const isAlreadyInQueue = subscripedUsers[userID]!.songs.some((song) => {
      return song.url == url;
    });

    if (isAlreadyInQueue) {
      return ADD_SONG_ALREADY_IN_QUEUE;
    }
  }

  let videoInfo: videoInfo;
  try {
    videoInfo = await getYouTubeInfo(url);
  } catch (err) {
    console.log(err);
    return ADD_SONG_INVALID_SONG;
  }
  const title: string = videoInfo.videoDetails.title;
  const videoLength: number = parseInt(videoInfo.videoDetails.lengthSeconds);
  const videoViews: number = parseInt(videoInfo.videoDetails.viewCount);
  const isAgeRestricted: boolean = videoInfo.videoDetails.age_restricted;
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

  let videoBlob: Buffer<ArrayBufferLike>;
  try {
    videoBlob = await getYouTubeVideo(url);
  } catch (err) {
    console.error(err);
    return ADD_SONG_INVALID_SONG;
  }

  console.log(subscripedUsers[userID]?.songs.length);
  subscripedUsers[userID]?.songs.push({
    url: url,
    videoInfo: videoInfo,
    blob: videoBlob.toString("base64"),
    status: "pending",
  });
  subscripedUsers[userID]?.eventEmitter.emit("emit", { type: "new_song" });
  return ADD_SONG_SUCCESS_MESSAGE(title);
}

function getYouTubeInfo(url: string): Promise<IVideoInfo> {
  return ytdl.getBasicInfo(url);
}

function getYouTubeVideo(url: string): Promise<Buffer> {
  console.log("adding song");
  return new Promise((resolve, _) => {
    const stream = ytdl(url, {
      filter: "audio",
    });
    const buffers: Buffer[] = [];
    stream.on("data", function (buf: Buffer) {
      buffers.push(buf);
    });
    stream.on("end", function () {
      const data = Buffer.concat(buffers);
      resolve(data);
    });
  });
}

const SKIP_SONG_SUCCESS_MESSAGE = "successfully skiped a song";
export function skipSong(userID: string): string {
  subscripedUsers[userID]?.eventEmitter.emit("emit", { type: "skip" });
  return SKIP_SONG_SUCCESS_MESSAGE;
}

const SET_VOLUME_ERROR_MESSAGE = "volume must be a number between 0 and 100";
const SET_VOLUME_SUCCESS_MESSAGE = "volume got set to:";
export function setVolume(userID: string, value: string): string {
  const volume = parseInt(value);

  if (isNaN(volume) || volume > 100 || volume < 0) {
    return SET_VOLUME_ERROR_MESSAGE;
  }
  subscripedUsers[userID]?.eventEmitter.emit("emit", {
    type: "volume",
    value: Math.floor(volume) / 100,
  });
  return `${SET_VOLUME_SUCCESS_MESSAGE} ${volume}%`;
}
