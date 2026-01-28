"use client";

import SongQueue from "./SongQueue";
import { Card, CardContent, CardHeader } from "~/shadcn/components/ui/card";
import YoutubePlayer from "./YoutubePlayer";
import "~/styles/player.css";
import { api } from "~/trpc/react";
import { type AvailableEmits } from "types/subscriptedUsers";
import { emitSongEvent } from "./songEvents";

export default function Player() {
  api.song.songSubscription.useSubscription(undefined, {
    onData: (data: AvailableEmits) => {
      if (process.env.NODE_ENV === "development") {
        console.debug("Received command:", data);
      }

      emitSongEvent(data);
    },
  });

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
      <YoutubePlayer />
    </div>
  );
}
