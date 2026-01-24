"use client";

import SongQueue from "./SongQueue";
import { Card, CardContent, CardHeader } from "~/shadcn/components/ui/card";
import YoutubePlayer from "./YoutubePlayer";
import "~/styles/player.css";
import { api } from "~/trpc/react";
import { type AvailableEmits } from "types/subscriptedUsers";

export default function Player() {
  api.song.songSubscription.useSubscription(undefined, {
    onData: (data: AvailableEmits) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Received command:", data);
      }

      switch (data.type) {
        case "skip":
          break;
        case "new_song":
          break;
        case "volume":
          break;
        case "stop":
          break;
        case "play":
          break;
        case "clear":
          break;
      }
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
