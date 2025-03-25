import type { videoInfo } from "@distube/ytdl-core";
import ytdl, { createAgent } from "@distube/ytdl-core";
import { readFileSync } from "fs";
import type { Cookie } from "tough-cookie";

type ytdlCookies = (ytdl.Cookie | Cookie)[];

const cookiesUrl: string = process.cwd() + "/cookies.json";
const ytCookies: ytdlCookies = JSON.parse(
  readFileSync(cookiesUrl).toString(),
) as ytdlCookies;
const agent = createAgent(ytCookies);

export function getYouTubeInfo(url: string): Promise<videoInfo> {
  return ytdl.getBasicInfo(url, { agent });
}

export function getYouTubeVideo(url: string): Promise<Buffer> {
  console.log("adding song");
  return new Promise((resolve, _) => {
    const stream = ytdl(url, {
      filter: "audioonly",
      agent,
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
