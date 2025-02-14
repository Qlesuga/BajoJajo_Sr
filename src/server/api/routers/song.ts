import ytdl from "@distube/ytdl-core";
import type { videoInfo as IVideoInfo } from "@distube/ytdl-core";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { EventEmitter, on } from "stream";

interface ISong {
  videoInfo: IVideoInfo;
  blob: string;
  status: "playing" | "pending";
}

interface ISubscriptedUser {
  eventEmitter: EventEmitter;
  songs: ISong[];
}

const subscripedUsers: Record<string, ISubscriptedUser> = {};

export const userID = "cm6i06a590000ihf1liidcap0";
/*
const url1 = "https://www.youtube.com/watch?v=UxKvf4e6Nso";
const url2 = "https://www.youtube.com/watch?v=0u1a1lF02Ac";

await addSongToUser(userID, url1);
await addSongToUser(userID, url2);
await addSongToUser(userID, url1);
await addSongToUser(userID, url2);
await addSongToUser(userID, url1);
await addSongToUser(userID, url2);
await addSongToUser(userID, url1);
await addSongToUser(userID, url2);
*/

export const songRouter = createTRPCRouter({
  nextSong: publicProcedure.query(async () => {
    console.log("SONG REQUESTED");
    if (!(userID in subscripedUsers)) {
      const emitter = new EventEmitter();
      subscripedUsers[userID] = {
        eventEmitter: emitter,
        songs: [],
      };
    }
    const songs = subscripedUsers[userID].songs;
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

  songSubscription: publicProcedure.subscription(async function* (opts) {
    let emitter: EventEmitter;
    if (userID in subscripedUsers) {
      emitter = subscripedUsers[userID].eventEmitter;
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
      console.info("XD");
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
  const videoInfo = await getYouTubeInfo(url);
  const videoBlob = await getYouTubeVideo(url);
  console.log("song added");
  subscripedUsers[userID]?.songs.push({
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
