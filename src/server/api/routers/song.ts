import ytdl from "@distube/ytdl-core";
import type { videoInfo as IVideoInfo } from "@distube/ytdl-core";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { EventEmitter, on } from "stream";
import { z } from "zod";
import { db } from "~/server/db";

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
      if (!findUserFromLink) {
        return;
      }
      if (findUserFromLink.user.accounts.length == 0) {
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
      for await (const type of on(emitter, "emit", {
        signal: opts.signal,
      })) {
        yield { type: type[0] as string };
      }
    }),
});

export async function addSongToUser(userID: string, url: string) {
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
      return;
    }
  }
  const videoInfo = await getYouTubeInfo(url);
  const videoBlob = await getYouTubeVideo(url);

  console.log("song added");
  subscripedUsers[userID]?.songs.push({
    url: url,
    videoInfo: videoInfo,
    blob: videoBlob.toString("base64"),
    status: "pending",
  });
  subscripedUsers[userID]?.eventEmitter.emit("emit", "new_song");
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

export function skipSong(userID: string) {
  subscripedUsers[userID]?.eventEmitter.emit("emit", "skip");
}
