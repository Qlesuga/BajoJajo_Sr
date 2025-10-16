"use client";

import { useRef } from "react";
import YouTube from "react-youtube";
import SongQueue from "./SongQueue";
import { Card, CardContent, CardHeader } from "~/shadcn/components/ui/card";

export default function Player() {
  const videoID = "_-2dIuV34cs";
  const playerRef = useRef<YouTube>(null);
  const playerOpts = {
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <div className="flex h-screen w-screen flex-row gap-4 bg-[var(--background)] p-8">
      <Card className="h-full border-none">
        <CardHeader className="px-2 py-1">
          <h2 className="text-l font-semibold">Song Queue</h2>
        </CardHeader>
        <CardContent className="h-[calc(100%-20px)] px-2">
          <SongQueue />
        </CardContent>
      </Card>

      <YouTube ref={playerRef} opts={playerOpts} videoId={videoID} />
    </div>
  );
}
