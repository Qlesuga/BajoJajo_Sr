"use client";

import { useRef } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { useSongEventListener } from "./songEvents";
import { type AvailableEmits } from "types/subscriptedUsers";

type YoutubePlayerProps = {
  currentSong: string | null;
  playNextSongAction: (whatCurrentSongShouldBe: string) => void;
  initVolumeInPercentage: number;
};

export default function YoutubePlayer({
  currentSong,
  playNextSongAction,
  initVolumeInPercentage,
}: YoutubePlayerProps) {
  //! ADD SAVING VOLUME FROM USER CHANGE
  const playerEvent = useRef<YouTubeEvent>(null);

  useSongEventListener((event: AvailableEmits) => {
    const player = playerEvent.current;
    if (!player) return;

    if (event.type === "play") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      player.target.playVideo();
    } else if (event.type === "stop") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      player.target.pauseVideo();
    } else if (event.type === "volume") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      player.target.setVolume(event.value);
    }
  });

  const onReady = (event: YouTubeEvent) => {
    playerEvent.current = event;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    event.target.setVolume(initVolumeInPercentage);
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

  return (
    <YouTube
      opts={playerOpts}
      videoId={currentSong}
      onReady={onReady}
      onEnd={() => playNextSongAction(currentSong)}
    />
  );
}
