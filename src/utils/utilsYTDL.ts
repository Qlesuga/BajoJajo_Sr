import { readFileSync, existsSync } from "fs";

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
  const url_split = url.split("?");
  let final_url;
  if (url_split.length == 2) {
    final_url = url_split[1];
  } else if (url_split.length == 1) {
    final_url = url_split[0];
  } else {
    return null;
  }
  if (!final_url) {
    return null;
  }
  const info = await fetch(
    `${YT_DLP_API_URL}/info/${encodeURIComponent(final_url)}`,
  );
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
    console.error(e);
    return null;
  }
  return file;
}
