"server-only";

interface TwitchOAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export const getAppAccessToken = async (): Promise<TwitchOAuthToken> => {
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

  const data: unknown = await response.json();
  if (
    typeof data === "object" &&
    data !== null &&
    "access_token" in data &&
    "expires_in" in data &&
    "token_type" in data
  ) {
    const typedData = data as Record<string, unknown>;

    if (
      typeof typedData.access_token === "string" &&
      typeof typedData.expires_in === "number" &&
      typeof typedData.token_type === "string"
    ) {
      return {
        access_token: typedData.access_token,
        expires_in: typedData.expires_in,
        token_type: typedData.token_type,
      };
    }
  }
  throw new Error("Invalid response format from Twitch API");
};
