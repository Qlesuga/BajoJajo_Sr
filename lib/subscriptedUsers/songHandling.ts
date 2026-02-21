import { getCurrentSongInfo } from "~/utils/song/getCurrentSongInfo";
import { emitToSubscriptedUser } from "./subscripedUsers";
import { setUserVolumeSetting } from "~/utils/setUserVolumeSetting";
import z from "zod";
import { getUserPlayerSettings } from "~/utils/getUserPlayerSettings";
import { finalize } from "zod/v4/core";

export function stopSong(userID: string): null {
  emitToSubscriptedUser(userID, { type: "stop" });
  return null;
}

const SKIP_SONG_SUCCESS_MESSAGE = "successfully skiped a song";
export async function skipSong(userID: string): Promise<string> {
  const value = await getCurrentSongInfo(userID);
  if (!value) {
    return "no song is currently playing";
  }

  emitToSubscriptedUser(userID, { type: "skip", value: value?.songID });
  return SKIP_SONG_SUCCESS_MESSAGE;
}

export async function refetchSongs(userID: string) {
  emitToSubscriptedUser(userID, { type: "refetch_songs" });
}

export function playSong(userID: string): null {
  emitToSubscriptedUser(userID, { type: "play" });
  return null;
}

export function clearQueueOnFrontend(broadcasterID: string): null {
  emitToSubscriptedUser(broadcasterID, { type: "clear" });
  return null;
}

const SET_VOLUME_ERROR_MESSAGE =
  "volume must be a number between 0 and 100 or a string in format +10 or -5";
const SET_VOLUME_SUCCESS_MESSAGE = "volume got set to:";
const VOLUME_NUMBER_SCHEMA = z.number().min(0).max(100);
const VOLUME_STRING_SCHEMA = z
  .string()
  .min(2)
  .max(4)
  .regex(/^[+-][0-9][0-9]?|^[+-]100/);
export async function setVolume(
  broadcasterID: string,
  value: string,
): Promise<string> {
  let volume = 0;

  const volumeNumberParsed = VOLUME_NUMBER_SCHEMA.safeParse(parseInt(value));
  if (volumeNumberParsed.success) {
    volume = volumeNumberParsed.data;
  }

  const volumeStringParsed = VOLUME_STRING_SCHEMA.safeParse(value);
  if (volumeStringParsed.success) {
    const currentVolume =
      (await getUserPlayerSettings(broadcasterID))!.volumeInPercentage ?? 0;
    console.log(currentVolume);

    volume = eval(`${currentVolume}${volumeStringParsed.data}`) as number;
  }

  if (!volumeNumberParsed.success && !volumeStringParsed.success) {
    return SET_VOLUME_ERROR_MESSAGE;
  }

  volume = Math.max(0, Math.min(100, volume));

  setUserVolumeSetting(broadcasterID, volume).catch((e) => console.error(e));
  emitToSubscriptedUser(broadcasterID, {
    type: "volume",
    value: volume,
  });

  return `${SET_VOLUME_SUCCESS_MESSAGE} ${volume}%`;
}
