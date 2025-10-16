"use client";

import "~/styles/player.css";
import { api } from "~/trpc/react";
import PlayingPlayerComponent from "./playingPlayerComponent";
import { b64toBlob } from "~/utils/stringB64ToBlob";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import type { SongType } from "types/song";
import { type AvailableEmits } from "types/subscriptedUsers";
import EmptyPlayerComponent from "./emptyPlayerComponent";
import { Card, CardContent, CardFooter } from "~/shadcn/components/ui/card";

interface PlayerComponentProps {
  initVolumeInPercentage: number;
  initCurrentSong: SongType | null;
  initNextSong: SongType | null;
}

export default function PlayerComponent({
  initVolumeInPercentage,
  initCurrentSong,
  initNextSong,
}: PlayerComponentProps) {
  const { link } = useParams<{ link: string }>();
  const [currentSong, setCurrentSong] = useState<SongType | null>(
    initCurrentSong,
  );
  const nextSong = useRef<SongType | null>(initNextSong);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef<number>(initVolumeInPercentage / 100);
  const isFetching = useRef(false);

  const { mutate: completeCurrentSongAndGetNext } =
    api.songOld.getNextSongAndCompleteCurrent.useMutation({
      onSuccess: (data) => {
        isFetching.current = false;
        if (currentSong) {
          nextSong.current = data;
          return;
        }
        setCurrentSong(data);
      },
    });

  const playNextSong = () => {
    if (isFetching.current) return;
    console.log("play next song");

    if (audioRef.current) {
      audioRef.current.pause();
    }

    isFetching.current = true;
    completeCurrentSongAndGetNext({
      userLink: link,
      songID: currentSong?.songID,
    });

    setCurrentSong(nextSong.current);
    nextSong.current = null;
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const playAudio = () => {
    audioRef.current?.play().catch(() => null);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!currentSong) return;
    const newAudio = new Audio(
      URL.createObjectURL(b64toBlob(currentSong.songBlob, "audio/mp3")),
    );
    newAudio.volume = volumeRef.current;
    newAudio.loop = false;

    newAudio.addEventListener("ended", () => {
      console.log("song ended");
      playNextSong();
    });

    audioRef.current = newAudio;
    playAudio();
    if (process.env.NODE_ENV == "development") {
      newAudio.playbackRate = 5;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", playNextSong);
        const src = audioRef.current.src;
        audioRef.current.pause();
        URL.revokeObjectURL(src);
        audioRef.current = null;
      }
    };
  }, [currentSong]);

  api.songOld.songSubscription.useSubscription(link, {
    onData: (data: AvailableEmits) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Received command:", data);
      }

      switch (data.type) {
        case "skip":
          playNextSong();
          break;
        case "new_song":
          // TODO fix this
          break;
        case "volume":
          if (data.value != null && audioRef.current) {
            volumeRef.current = data.value;
            audioRef.current.volume = data.value;
          }
          break;
        case "stop":
          stopAudio();
          break;
        case "play":
          playAudio();
          break;
        case "clear":
          nextSong.current = null;
          setCurrentSong(null);
          break;
      }
    },
  });

  return (
    <div className="dark w-full">
      <Card
        className="h-144 w-screen"
        style={{ backgroundColor: "hsl(var(--background))" }}
      >
        <CardContent className="w-full p-6">
          {currentSong ? (
            <PlayingPlayerComponent
              key={currentSong.title}
              name={currentSong.title}
              artist={currentSong.songAuthor}
              length={currentSong.songLengthSeconds}
              image={currentSong.songThumbnail}
              isRunning={isPlaying}
            />
          ) : (
            <EmptyPlayerComponent />
          )}
        </CardContent>
        <CardFooter>
          <div className="flex gap-2">
            <button onClick={playAudio}>play</button>
            <button onClick={stopAudio}>stop</button>
            <button onClick={playNextSong}>next</button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
