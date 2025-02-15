import { getTwitchAppAccessToken } from "./twitchAuth";
import { getTwitchConduitId } from "./twitchConduit";

export async function createTwitchChatSubscription(broadcasterUserId: string) {
  const twitchAppToken = await getTwitchAppAccessToken();
  const conduitID = await getTwitchConduitId();
  const response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${twitchAppToken}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        type: "channel.chat.message",
        version: "1",
        condition: {
          "content-type": "application/json",
          broadcaster_user_id: broadcasterUserId,
          user_id: "1245134202",
        },
        transport: {
          method: "conduit",
          conduit_id: `${conduitID}`,
        },
      }),
    },
  );
  console.log(response);
  console.log(await response.json());
  return "yikes";
}
