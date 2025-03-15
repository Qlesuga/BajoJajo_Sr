import { getTwitchAppAccessToken } from "./twitchGetAppAccessToken";

interface ITwitchUserEndpointResponse {
  data: {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email: string;
    created_at: string;
  }[];
}

async function twitchGetUserIDFromUserName(userName: string) {
  const twitchAppToken = await getTwitchAppAccessToken();
  const res = await fetch(
    `https://api.twitch.tv/helix/users?login=${userName}`,
    {
      headers: {
        Authorization: `Bearer ${twitchAppToken}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
      },
    },
  );
  if (!res) {
    return;
  }
  const body = (await res.json()) as ITwitchUserEndpointResponse;
  const userID = body.data[0]?.id;
  if (!userID) {
    return;
  }
  return userID;
}

export { twitchGetUserIDFromUserName };
