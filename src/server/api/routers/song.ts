import { z } from "zod";
import ytdl from "@distube/ytdl-core";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

let i = 0;
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
    i++;
    console.log(i);
    console.log(data);
    return {
      songTitle: title,
      songAuthor: ownerChannelName,
      songLength: parseInt(lengthSeconds),
      songThumbnail: thumbnails[1] ? thumbnails[1].url : "",
      songBlob: data.toString("base64"),
    };
  }),
});
