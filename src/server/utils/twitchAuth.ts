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
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const body = `client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: body,
    headers: headers,
  });

  if (!response.ok) {
    throw new Error(
      `Twitch API error: ${response.status} ${response.statusText}`,
    );
  }

  const newTwitchToken: unknown = await response.json();
  if (
    typeof newTwitchToken === "object" &&
    newTwitchToken !== null &&
    "access_token" in newTwitchToken &&
    "expires_in" in newTwitchToken &&
    "token_type" in newTwitchToken
  ) {
    const typedData = newTwitchToken as Record<string, unknown>;

    if (
      typeof typedData.access_token === "string" &&
      typeof typedData.expires_in === "number" &&
      typeof typedData.token_type === "string"
    ) {
      const token: TwitchOAuthToken = {
        access_token: typedData.access_token,
        expires_in: typedData.expires_in,
        token_type: typedData.token_type,
      };
      await DiskCache.set<string>(
        TWITCH_OAUTH_TOKEN_CACHE,
        token.access_token,
        typedData.expires_in,
      );
      return token.access_token;
    }
  }
  throw new Error("Invalid response format from Twitch API");
};
