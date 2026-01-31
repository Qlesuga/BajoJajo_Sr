"use client";

import { useRef } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { useSongEventListener } from "./songEvents";
import { type AvailableEmits } from "types/subscriptedUsers";

type YoutubePlayerProps = {
  currentSong: string | null;
};

export default function YoutubePlayer({ currentSong }: YoutubePlayerProps) {
  const playerEvent = useRef<YouTubeEvent>(null);

  useSongEventListener((event: AvailableEmits) => {
    console.debug(playerEvent.current);
    if (event.type === "play") {
      playerEvent.current?.target.playVideo();
    } else if (event.type === "stop") {
      playerEvent.current?.target.pauseVideo();
    } else if (event.type === "volume") {
      playerEvent.current?.target.setVolume(event.value);
    }
  });

  const onReady = (event: YouTubeEvent) => {
    playerEvent.current = event;
    console.debug("Player is ready", event);
  };

  const playerOpts = {
    playerVars: {
      autoplay: 1,
    },
  };

  if (!currentSong) {
    return <div>No song is currently playing.</div>;
  }

  return <YouTube opts={playerOpts} videoId={currentSong} onReady={onReady} />;
}
