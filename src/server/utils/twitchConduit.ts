import { DiskCache } from "./cache";
import { getTwitchAppAccessToken } from "./twitchAuth";

const CACHE_TWITCH_CONDUIT_ID = "twitch-conduit-id";
const TWITCH_CREATE_CONDUIT_URL =
  "https://api.twitch.tv/helix/eventsub/conduits";

interface TwitchCreateConduitResponse {
  data: [{ id: string; shared_count: number }];
}

export async function getTwitchConduitId() {
  const conduitId = await DiskCache.get(CACHE_TWITCH_CONDUIT_ID);
  if (conduitId) {
    return conduitId;
  }
  const twitchAppToken = await getTwitchAppAccessToken();
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
  console.log(createConduitResponseBody);
  await DiskCache.set<string>(
    CACHE_TWITCH_CONDUIT_ID,
    createConduitResponseBody.data[0].id,
  );
  return conduitId;
}
