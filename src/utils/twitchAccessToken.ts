import { DiskCache } from "./cache";

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

const CACHE_ACCESS_TOKEN = "twitch-access-token";

export async function getTwitchAccessToken(): Promise<string> {
  const accessToken = await DiskCache.get<string>(CACHE_ACCESS_TOKEN);
  if (accessToken) {
    return accessToken;
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      client_id: `${process.env.TWITCH_CLIENT_ID}`,
      grant_type: "refresh_token",
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      refresh_token: process.env.TWITCH_REFRESH_TOKEN,
    }),
  });
  const body = (await res.json()) as RefreshTokenResponse;
  console.log(body);
  await DiskCache.set<string>(
    CACHE_ACCESS_TOKEN,
    body.access_token,
    body.expires_in,
  );
  return body.access_token;
}
