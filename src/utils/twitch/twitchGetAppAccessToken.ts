"server-only";

import { RedisCache } from "../cache";

interface TwitchOAuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

const CACHE_TWITCH_APP_ACCESS_TOKEN = "twitch-app-access-token";

export const getTwitchAppAccessToken = async (): Promise<string> => {
  const authToken = await RedisCache.get<string>(CACHE_TWITCH_APP_ACCESS_TOKEN);
  if (authToken) {
    return authToken;
  }

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Twitch API error: ${response.status} ${response.statusText}`,
    );
  }

  const newTwitchToken = (await response.json()) as TwitchOAuthToken;
  console.log(newTwitchToken);
  await RedisCache.set<string>(
    CACHE_TWITCH_APP_ACCESS_TOKEN,
    newTwitchToken.access_token,
    newTwitchToken.expires_in,
  );
  return newTwitchToken.access_token;
};
