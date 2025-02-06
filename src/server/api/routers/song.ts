import ytdl from "@distube/ytdl-core";
import type { videoInfo as IVideoInfo } from "@distube/ytdl-core";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { EventEmitter, on } from "stream";
import { auth } from "~/server/auth";

/*
import { cos } from "~/server/utils/twitchConduit";
cos()
  .then((data) => {
    return;
  })
  .catch((error) => {
    return;
  });
*/

interface ISong {
  videoInfo: IVideoInfo;
  blob: string;
  status: "playing" | "pending";
}

interface ISubscriptedUser {
  eventEmitter: EventEmitter;
  songs: ISong[];
}

let i = 0;

const subscripedUsers: Record<string, ISubscriptedUser> = {};

export const songRouter = createTRPCRouter({
  nextSong: publicProcedure.query(async () => {
    const userID = "cm6i06a590000ihf1liidcap0";
    const url1 = "https://www.youtube.com/watch?v=UxKvf4e6Nso";
    const url2 = "https://www.youtube.com/watch?v=0u1a1lF02Ac";

    await addSongToUser(userID, url1);
    await addSongToUser(userID, url2);
    console.log(subscripedUsers);
    const song = subscripedUsers[userID].songs[i];
    if (!song) {
      return;
    }
    i++;
    const { videoDetails } = song?.videoInfo;
    const { title, lengthSeconds, ownerChannelName, thumbnails } = videoDetails;

    return {
      songTitle: title,
      songAuthor: ownerChannelName,
      songLength: parseInt(lengthSeconds),
      songThumbnail: thumbnails[1] ? thumbnails[1].url : "",
      songBlob: song.blob,
    };
  }),

  songSubscription: publicProcedure.subscription(async function* (opts) {
    const user = await auth();
    if (!user) {
      return;
    }
    let emitter: EventEmitter;
    if (user.user.id in subscripedUsers) {
      emitter = subscripedUsers[user.user.id]?.eventEmitter;
    } else {
      emitter = new EventEmitter();
      subscripedUsers[user.user.id] = {
        eventEmitter: emitter,
        songs: [],
      };
    }
    for await (const [data] of on(emitter, "add", {
      signal: opts.signal,
    })) {
      yield data;
    }
  }),
});

async function addSongToUser(userID: string, url: string) {
  if (!(userID in subscripedUsers)) {
    const emitter = new EventEmitter();
    subscripedUsers[userID] = {
      eventEmitter: emitter,
      songs: [],
    };
  }
  console.log(subscripedUsers);
  const videoInfo = await getYouTubeInfo(url);
  const videoBlob = await getYouTubeVideo(url);
  subscripedUsers[userID]?.songs.push({
    videoInfo: videoInfo,
    blob: videoBlob.toString("base64"),
    status: "pending",
  });
}

function getYouTubeInfo(url: string): Promise<IVideoInfo> {
  return ytdl.getBasicInfo(url);
}

function getYouTubeVideo(url: string): Promise<Buffer> {
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
