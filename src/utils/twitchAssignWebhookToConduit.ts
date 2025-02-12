import { getTwitchAppAccessToken } from "./twitchAuth";
import { getTwitchConduitId } from "./twitchConduit";

export async function twitchAssaignWebhookToConduit() {
  const conduitId = await getTwitchConduitId();
  const twitchAppToken = await getTwitchAppAccessToken();
  const chujwie = await fetch(
    "https://api.twitch.tv/helix/eventsub/conduits/shards",
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${twitchAppToken}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        conduit_id: conduitId,
        shards: [
          {
            id: "0",
            transport: {
              method: "webhook",
              callback: "https://c65f-95-160-184-208.ngrok-free.app/api/test",
              secret: process.env.TWITCH_WEBHOOK_SECRET,
            },
          },
        ],
      }),
    },
  );
  console.log(await chujwie.json());
}
