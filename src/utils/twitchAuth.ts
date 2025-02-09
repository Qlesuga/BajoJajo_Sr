"server-only";

import { DiskCache } from "./cache";

interface TwitchOAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

const TWITCH_OAUTH_TOKEN_CACHE = "twitch-oauth-token";

export const getTwitchAppAccessToken = async (): Promise<string> => {
  const authToken = await DiskCache.get<string>(TWITCH_OAUTH_TOKEN_CACHE);
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
  await DiskCache.set<string>(
    TWITCH_OAUTH_TOKEN_CACHE,
    newTwitchToken.access_token,
    newTwitchToken.expires_in,
  );
  return newTwitchToken.access_token;
};
