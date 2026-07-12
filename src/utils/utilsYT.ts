import { db } from "~/server/db";
import { env } from "~/env";
import {
  parse as iso8601Parse,
  toSeconds as iso8601ToSecounds,
} from "iso8601-duration";
import getVideoId from "get-video-id";

export type InfoApiResponse = {
  id: string;
  title: string;
  videoLength: number;
  videosViews: number;
  isAgeRestricted: boolean;
  channel: string;
  thumbnail: string;
};

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/videos";

export async function getYouTubeInfo(
  url: string,
): Promise<InfoApiResponse | null> {
  const videoId = getVideoId(url).id;
  if (!videoId) {
    console.error("Error while extracting videoId: ", url);
    return null;
  }

  const params = new URLSearchParams({
    part: "snippet,contentDetails,statistics",
    id: videoId,
    key: env.YOUTUBE_KEY,
  });

  const response = await fetch(`${YOUTUBE_API_URL}?${params.toString()}`);

  if (response.status !== 200) {
    console.error("YouTube API error:", response.status, await response.text());
    return null;
  }

  const data = (await response.json()) as {
    items: Array<{
      id: string;
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails: {
          high?: { url: string };
          medium?: { url: string };
          default?: { url: string };
        };
      };
      contentDetails: {
        duration: string;
        contentRating?: { ytRating?: string };
      };
      statistics: {
        viewCount: string;
      };
    }>;
  };

  const item = data.items[0];
  if (!item) {
    return null;
  }

  const json: InfoApiResponse = {
    id: item.id,
    title: item.snippet.title,
    videoLength: iso8601ToSecounds(iso8601Parse(item.contentDetails.duration)),
    videosViews: parseInt(item.statistics.viewCount, 10),
    isAgeRestricted:
      item.contentDetails.contentRating?.ytRating === "ytAgeRestricted",
    channel: item.snippet.channelTitle,
    thumbnail:
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      "",
  };

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
