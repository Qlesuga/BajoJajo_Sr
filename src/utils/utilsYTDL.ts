import { db } from "~/server/db";

export type InfoApiResponse = {
  id: string;
  title: string;
  videoLength: number;
  videosViews: number;
  isAgeRestricted: boolean;
  channel: string;
  thumbnail: string;
};

const YT_DLP_API_URL = "http://yt-dlp:8000";

export async function getYouTubeInfo(
  url: string,
): Promise<InfoApiResponse | null> {
  const info = await fetch(`${YT_DLP_API_URL}/info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: url,
    }),
  });
  if (info.status != 200) {
    return null;
  }
  const json = (await info.json()) as InfoApiResponse;
  db.songInfo
    .upsert({
      where: {
        songID: json.id,
      },
      update: {},
      create: {
        songID: json.id,
        title: json.title,
        autohor: json.channel,
        lengthInSeconds: json.videoLength,
        thumbnailUrl: json.thumbnail,
      },
    })
    .catch((e) => {
      console.error(e);
    });
  return json;
}
