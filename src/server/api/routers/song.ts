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
  blolb: string;
  status: "playing" | "pending";
}

interface ISubscriptedUser {
  eventEmitter: EventEmitter;
  songs: ISong[];
}

const watchedUsers: Record<string, ISubscriptedUser> = {};

setInterval(() => {
  Object.keys(watchedUsers).map((key) => {
    watchedUsers[key]?.eventEmitter.emit("add", key);
  });
}, 2000);

export const songRouter = createTRPCRouter({
  nextSong: publicProcedure.query(async () => {
    const url = "https://www.youtube.com/watch?v=0u1a1lF02Ac";
    const { videoDetails } = await ytdl.getBasicInfo(url);
    const { title, lengthSeconds, ownerChannelName, thumbnails } = videoDetails;

    const data: Buffer = await new Promise((resolve, _) => {
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

    return {
      songTitle: title,
      songAuthor: ownerChannelName,
      songLength: parseInt(lengthSeconds),
      songThumbnail: thumbnails[1] ? thumbnails[1].url : "",
      songBlob: data.toString("base64"),
    };
  }),

  songSubscription: publicProcedure.subscription(async function* (opts) {
    const user = await auth();
    if (!user) {
      return;
    }
    const emitter = new EventEmitter();

    watchedUsers[user.user.id] = {
      eventEmitter: emitter,
      songs: [],
    };
    for await (const [data] of on(emitter, "add", {
      signal: opts.signal,
    })) {
      yield data;
    }
  }),
});
