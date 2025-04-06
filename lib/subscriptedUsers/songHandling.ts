import { emitToSubscriptedUser } from "./subscripedUsers";

export function stopSong(userID: string): null {
  emitToSubscriptedUser(userID, { type: "stop" });
  return null;
}

const SKIP_SONG_SUCCESS_MESSAGE = "successfully skiped a song";
export function skipSong(userID: string): string {
  emitToSubscriptedUser(userID, { type: "skip" });
  return SKIP_SONG_SUCCESS_MESSAGE;
}

export function playSong(userID: string): null {
  emitToSubscriptedUser(userID, { type: "play" });
  return null;
}

const SET_VOLUME_ERROR_MESSAGE = "volume must be a number between 0 and 100";
const SET_VOLUME_SUCCESS_MESSAGE = "volume got set to:";
export function setVolume(userID: string, value: string): string {
  const volume = parseInt(value);

  if (isNaN(volume) || volume > 100 || volume < 0) {
    return SET_VOLUME_ERROR_MESSAGE;
  }
  emitToSubscriptedUser(userID, {
    type: "volume",
    value: Math.floor(volume) / 100,
  });
  return `${SET_VOLUME_SUCCESS_MESSAGE} ${volume}%`;
}
