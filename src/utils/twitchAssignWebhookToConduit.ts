import { getTwitchAppAccessToken } from "./twitchAuth";
import { getTwitchConduitId } from "./twitchConduit";

const WEBHOOK_ENDPOINT = "twitchWebHookHandler";
const URL = "8d4a-95-160-184-208.ngrok-free.app";

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
              callback: `https://${URL}/api/${WEBHOOK_ENDPOINT}`,
              secret: process.env.TWITCH_WEBHOOK_SECRET,
            },
          },
        ],
      }),
    },
  );
  console.log(await chujwie.json());
}
