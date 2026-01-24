"use client";

import { useRef } from "react";
import YouTube from "react-youtube";

export default function YoutubePlayer() {
  const videoID = "_-2dIuV34cs";
  const playerRef = useRef<YouTube>(null);
  const playerOpts = {
    playerVars: {
      autoplay: 0,
    },
  };

  return <YouTube ref={playerRef} opts={playerOpts} videoId={videoID} />;
}
