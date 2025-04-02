import { getTwitchAppAccessToken } from "./twitchGetAppAccessToken";
import { getTwitchConduitId } from "./twitchConduit";

const WEBHOOK_ENDPOINT = "twitchWebHookHandler";
const URL = process.env.TWITCH_WEBHOOK_ENDPOINT;

type twitchAssaignWebhookToConduitResponse = {
  data: {
    id: string;
    status: string;
    transport: {
      method: "webhook";
      callback: string;
    };
  }[];
};

export async function twitchAssaignWebhookToConduit() {
  const conduitId = await getTwitchConduitId();
  const twitchAppToken = await getTwitchAppAccessToken();
  const assaingWebhookResponse = await fetch(
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
  const body: twitchAssaignWebhookToConduitResponse =
    (await assaingWebhookResponse.json()) as twitchAssaignWebhookToConduitResponse;
  console.log(body?.data);
}
