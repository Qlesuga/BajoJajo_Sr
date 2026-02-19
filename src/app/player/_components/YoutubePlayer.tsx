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

const AUTOSKIP_THRESHOLD = 15;

const PLAYER_OPTS = {
  playerVars: {
    autoplay: 1,
  },
};

export default function YoutubePlayer({
  currentSong,
  playNextSongAction,
  initVolumeInPercentage,
}: YoutubePlayerProps) {
  //! ADD SAVING VOLUME FROM USER CHANGE
  const playerEvent = useRef<YouTubeEvent>(null);
  const songDuration = useRef<number>(-1);
  const autoskipCount = useRef<number>(0);
  const isSkipping = useRef<boolean>(false);

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
    isSkipping.current = false;
    autoskipCount.current = 0;
    playerEvent.current = event;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    songDuration.current = event.target.getDuration();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    event.target.setVolume(initVolumeInPercentage);
    console.debug("Player is ready", event);
  };

  //SKIP SONG WHEN IT REACHES THE END, BUT FOR SOME REASON THE END EVENT IS NOT ALWAYS TRIGGERED
  setInterval(() => {
    if (songDuration.current === -1 || isSkipping.current) return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const currentTime: number = playerEvent.current!.target.getCurrentTime();
    if (currentTime < songDuration.current - 0.5) {
      return;
    }

    autoskipCount.current += 1;

    if (autoskipCount.current > AUTOSKIP_THRESHOLD) {
      console.debug("Autoskip threshold reached, skipping to next song.");
      isSkipping.current = true;
      playNextSongAction(currentSong!);
    }
  }, 1000);

  if (!currentSong) {
    return <div>No song is currently playing.</div>;
  }

  return (
    <YouTube
      opts={PLAYER_OPTS}
      videoId={currentSong}
      onReady={onReady}
      onEnd={() => {
        isSkipping.current = true;
        playNextSongAction(currentSong);
      }}
    />
  );
}
