"use client";

import "~/styles/player.css";
import { api } from "~/trpc/react";
import PlayingPlayerComponent from "./playingPlayerComponent";
import { b64toBlob } from "~/utils/stringB64ToBlob";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import type { SongType } from "types/song";
import { type AvailableEmits } from "types/subscriptedUsers";
import EmptyPlayerComponent from "./emptyPlayerComponent";

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
  const [nextSong, setNextSong] = useState<SongType | null>(initNextSong);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef<number>(initVolumeInPercentage / 100);

  const { mutate: completeCurrentSongAndGetNext, data: nextSongData } =
    api.song.getNextSongAndCompleteCurrent.useMutation();

  const playNextSong = () => {
    console.log("play next song");

    if (audioRef.current) {
      audioRef.current.pause();
    }

    console.log(currentSong?.songID);
    completeCurrentSongAndGetNext({
      userLink: link,
      songID: currentSong?.songID,
    });
    setCurrentSong(nextSong);
  };

  useEffect(() => {
    if (nextSongData) {
      setNextSong(nextSongData);
    }
  }, [nextSongData]);

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
      playNextSong();
    });

    newAudio.play().catch(() => null);
    setIsPlaying(true);

    audioRef.current = newAudio;

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

  api.song.songSubscription.useSubscription(link, {
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
          setNextSong(null);
          setCurrentSong(null);
          break;
      }
    },
  });

  return (
    <div className="dark w-full">
      {currentSong ? (
        <PlayingPlayerComponent
          key={currentSong.title}
          name={currentSong.title}
          artist={currentSong.songAuthor}
          length={currentSong.songLengthSeconds}
          image={currentSong.songThumbnail}
          getNextSongAction={playNextSong}
          isRunning={isPlaying}
          stopAudioAction={stopAudio}
          playAudioAction={playAudio}
        />
      ) : (
        <EmptyPlayerComponent />
      )}
    </div>
  );
}
