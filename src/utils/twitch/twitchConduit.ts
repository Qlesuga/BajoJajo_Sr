import { RedisCache } from "../cache";
import { getTwitchAppAccessToken } from "./twitchGetAppAccessToken";

const CACHE_TWITCH_CONDUIT_ID = "twitch-conduit-id";
const TWITCH_CREATE_CONDUIT_URL =
  "https://api.twitch.tv/helix/eventsub/conduits";

interface TwitchCreateConduitResponse {
  data: [{ id: string; shared_count: number }];
}

let isConduitValidated = false;
export async function getTwitchConduitId(): Promise<string> {
  const conduitId = await RedisCache.get<string>(CACHE_TWITCH_CONDUIT_ID);
  if (conduitId && isConduitValidated) {
    return conduitId;
  }
  const twitchAppToken = await getTwitchAppAccessToken();

  const checkConduitResponse = await fetch(
    "https://api.twitch.tv/helix/eventsub/conduits",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${twitchAppToken}`,
        "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
      },
    },
  );
  const body: TwitchCreateConduitResponse =
    (await checkConduitResponse.json()) as TwitchCreateConduitResponse;
  const conduits = body.data;
  if (conduits.length == 1) {
    isConduitValidated = true;
    await RedisCache.set<string>(CACHE_TWITCH_CONDUIT_ID, conduits[0].id);
    return conduits[0].id;
  } else if (conduits.length > 1) {
    console.error("MORE THAN 1 CONDUIT FOUND, CLEANING UP");
    console.error(conduits);
    for (const conduitData of conduits) {
      console.info(`Deleting conduit id: ${conduitData.id}`);
      const res = await fetch("https://api.twitch.tv/helix/eventsub/conduits", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${twitchAppToken}`,
          "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id: conduitData.id }),
      });
      if (!res.ok) {
        throw new Error("FAILED WHILE DELETING CONDUITS");
      }
      console.info(`Deleted conduit id: ${conduitData.id}`);
    }
  }

  const createConduitResponse = await fetch(TWITCH_CREATE_CONDUIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${twitchAppToken}`,
      "Client-Id": `${process.env.TWITCH_CLIENT_ID}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      shard_count: 1,
    }),
  });
  const createConduitResponseBody: TwitchCreateConduitResponse =
    (await createConduitResponse.json()) as TwitchCreateConduitResponse;
  await RedisCache.set<string>(
    CACHE_TWITCH_CONDUIT_ID,
    createConduitResponseBody.data[0].id,
  );

  return conduitId!;
}
