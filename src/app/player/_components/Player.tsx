"use client";

import SongQueue from "./SongQueue";
import { Card, CardContent, CardHeader } from "~/shadcn/components/ui/card";
import YoutubePlayer from "./YoutubePlayer";
import "~/styles/player.css";
import { api } from "~/trpc/react";
import { type AvailableEmits } from "types/subscriptedUsers";
import { emitSongEvent } from "./songEvents";
import { useEffect, useState } from "react";

export default function Player() {
  const [currentSong, setCurrentSong] = useState<null | string>(null);

  const { data: initialCurrentSong } = api.song.getCurrentSong.useQuery();
  useEffect(() => {
    setCurrentSong(initialCurrentSong?.songID ?? null);
  }, [initialCurrentSong]);

  const { mutate: completeCurrentSong } =
    api.song.completeCurrentSong.useMutation({
      onSuccess: () => {
        refetchSongQueue().catch((e) => {
          console.error(e);
        });
      },
    });

  const { data: songQueue, refetch: refetchSongQueue } =
    api.song.getAllMySongs.useQuery(undefined, {
      refetchInterval: 15000,
      refetchIntervalInBackground: true,
    });

  const playNextSong = (whatCurrentSongShouldBe: string) => {
    console.debug(songQueue);
    console.debug(whatCurrentSongShouldBe, currentSong);
    if (whatCurrentSongShouldBe === currentSong) {
      setCurrentSong(songQueue?.[1]?.songID ?? null);
      completeCurrentSong({ songID: whatCurrentSongShouldBe });
    }
  };

  api.song.songSubscription.useSubscription(undefined, {
    onData: (data: AvailableEmits) => {
      if (process.env.NODE_ENV === "development") {
        console.debug("Received command:", data);
      }
      if (data.type === "skip") {
        playNextSong(data.value);
      } else if (data.type === "refetch_songs") {
        refetchSongQueue().catch((e) => {
          console.error(e);
        });
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
          <SongQueue Queue={songQueue} />
        </CardContent>
      </Card>
      <YoutubePlayer
        currentSong={currentSong}
        playNextSongAction={playNextSong}
      />
    </div>
  );
}
