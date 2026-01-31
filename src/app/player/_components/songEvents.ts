"use client";

import { useEffect } from "react";
import { type AvailableEmits } from "types/subscriptedUsers";

const SONG_EVENT_NAME = "song:event";

// Global event bus (per tab) for song events.
export const songEvents = new EventTarget();

export function emitSongEvent(event: AvailableEmits) {
  songEvents.dispatchEvent(
    new CustomEvent<AvailableEmits>(SONG_EVENT_NAME, { detail: event }),
  );
}

export function onSongEvent(listener: (event: AvailableEmits) => void) {
  const handler = (e: Event) => {
    listener((e as CustomEvent<AvailableEmits>).detail);
  };
  songEvents.addEventListener(SONG_EVENT_NAME, handler);
  return () => songEvents.removeEventListener(SONG_EVENT_NAME, handler);
}

/**
 * Simple hook for children components: listen to events coming from Player's songSubscription.
 */
export function useSongEventListener(listener: (event: AvailableEmits) => void) {
  useEffect(() => onSongEvent(listener), [listener]);
}

