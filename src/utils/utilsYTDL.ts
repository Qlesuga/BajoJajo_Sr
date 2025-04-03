import { readFileSync, existsSync } from "fs";

type InfoApiResponse = {
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
  const info = await fetch(`${YT_DLP_API_URL}/info/${encodeURIComponent(url)}`);
  if (info.status != 200) {
    return null;
  }
  return (await info.json()) as InfoApiResponse;
}

type DownloadApiResponse = {
  status: boolean;
};

export async function getYouTubeVideo(videoID: string): Promise<string | null> {
  const filePath = `/music/${videoID}.mp3`;
  const doesExist = existsSync(filePath);
  if (!doesExist) {
    const response = await fetch(`${YT_DLP_API_URL}/download/${videoID}`);
    const body: DownloadApiResponse =
      (await response.json()) as DownloadApiResponse;
    if (body.status == false) {
      return null;
    }
  }
  let file: string | undefined;
  try {
    file = readFileSync(filePath).toString("base64");
  } catch (e) {
    return null;
  }
  return file;
}
