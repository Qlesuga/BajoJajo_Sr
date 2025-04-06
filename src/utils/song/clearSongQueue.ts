import { redis } from "lib/redis";
import { clearQueueOnFrontend } from "lib/subscriptedUsers/songHandling";

const CLEAR_SONG_QUEUE_MESSAGE = "Song queue has been cleaned";
export async function clearSongQueue(broadcasterID: string): Promise<string> {
  await redis.del(`songs:${broadcasterID}`);
  clearQueueOnFrontend(broadcasterID);
  return CLEAR_SONG_QUEUE_MESSAGE;
}
