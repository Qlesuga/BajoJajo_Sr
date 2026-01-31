"use client";

import { useRef } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { useSongEventListener } from "./songEvents";
import { type AvailableEmits } from "types/subscriptedUsers";

export default function YoutubePlayer() {
  const videoID = "_-2dIuV34cs";
  const playerEvent = useRef<YouTubeEvent>(null);

  useSongEventListener((event: AvailableEmits) => {
    console.debug(playerEvent.current);
    if (event.type === "play") {
      playerEvent.current?.target.playVideo();
    } else if (event.type === "stop") {
      playerEvent.current?.target.pauseVideo();
    }
  });

  const onReady = (event: YouTubeEvent) => {
    playerEvent.current = event;
    console.debug("Player is ready", event);
  };

  const playerOpts = {
    playerVars: {
      autoplay: 0,
    },
  };

  return <YouTube opts={playerOpts} videoId={videoID} onReady={onReady} />;
}
