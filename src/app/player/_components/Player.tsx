"use client";

import SongQueue from "./SongQueue";
import { Card, CardContent, CardHeader } from "~/shadcn/components/ui/card";
import YoutubePlayer from "./YoutubePlayer";
import "~/styles/player.css";
import { api } from "~/trpc/react";
import { type AvailableEmits } from "types/subscriptedUsers";
import { emitSongEvent } from "./songEvents";
import { useEffect, useState } from "react";
import { useToast } from "~/shadcn/hooks/use-toast";

export default function Player() {
  const [currentSong, setCurrentSong] = useState<null | string>(null);
  const { toast } = useToast();

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
    if (currentSong == whatCurrentSongShouldBe) {
      setCurrentSong(songQueue?.[1]?.songID ?? null);
    } else {
      setCurrentSong(songQueue?.[0]?.songID ?? null);
    }
    completeCurrentSong({ songID: whatCurrentSongShouldBe });
  };

  api.song.songSubscription.useSubscription(undefined, {
    onData: (data: AvailableEmits) => {
      if (process.env.NODE_ENV === "development") {
        console.debug("Received command:", data);
      }
      if (data.type === "skip") {
        playNextSong(data.value);
      } else if (data.type === "new_song") {
        refetchSongQueue().catch((e) => {
          console.error(e);
        });
      }

      emitSongEvent(data);
    },
  });

  const { mutate: removeSongFromQueueAPI } =
    api.song.removeSongFromQueue.useMutation({
      onSuccess: () => {
        toast({
          description: "Successfully removed song from queue",
        });
        refetchSongQueue().catch((e) => {
          console.error(e);
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          description: `Failed to remove song from queue: ${error.message}`,
        });
        refetchSongQueue().catch((e) => {
          console.error(e);
        });
      },
    });

  const removeSongFromQueue = (songID: string, index: number) => {
    if (index == 0 && songID === currentSong) {
      playNextSong(songID);
      return;
    }
    removeSongFromQueueAPI({ songID, songIndex: index });
  };

  return (
    <div className="flex h-screen w-screen flex-row gap-4 bg-[var(--background)] p-8">
      <Card className="h-full border-none">
        <CardHeader className="px-2 py-1">
          <h2 className="text-l font-semibold">Song Queue</h2>
        </CardHeader>
        <CardContent className="h-[calc(100%-20px)] px-2">
          <SongQueue
            Queue={songQueue}
            removeSongFromQueue={removeSongFromQueue}
          />
        </CardContent>
      </Card>
      <YoutubePlayer
        currentSong={currentSong}
        playNextSongAction={playNextSong}
      />
    </div>
  );
}
