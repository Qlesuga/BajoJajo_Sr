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

interface PlayerComponentProps {
  initVolumeInPercentage: number;
}

export default function PlayerComponent({
  initVolumeInPercentage,
}: PlayerComponentProps) {
  const { link } = useParams<{ link: string }>();
  const [currentSong, setCurrentSong] = useState<SongType | null>(null);
  const [nextSong, setNextSong] = useState<SongType | null>();
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volume = useRef<number>(initVolumeInPercentage / 100);
  const { data, refetch } = api.song.nextSong.useQuery(link, {
    refetchOnWindowFocus: false,
  });

  api.song.songSubscription.useSubscription(link, {
    onData: (data: AvailableEmits) => {
      console.log(data);
      const command = data.type;
      if (command == "skip") {
        playNextSong();
      } else if (command == "new_song") {
        if (!nextSong) {
          void refetch();
        }
      } else if (command == "volume") {
        if (data.value != null && audioRef.current) {
          volume.current = data.value;
          audioRef.current.volume = data.value;
        }
      } else if (command == "stop") {
        stopAudio();
      } else if (command == "play") {
        playAudio();
      } else if (command == "clear") {
        setNextSong(null);
        setCurrentSong(null);
      }
    },
  });

  const stopAudio = () => {
    audioRef.current?.pause();
    setIsRunning(false);
  };

  const playAudio = () => {
    audioRef.current?.play().catch((e) => console.log(e));
    setIsRunning(true);
  };

  useEffect(() => {
    if (data) {
      if (!currentSong) {
        setCurrentSong(data);
      } else if (!nextSong && data.title !== currentSong.title) {
        setNextSong(data);
      }
    }
  }, [data, currentSong, nextSong]);

  useEffect(() => {
    if (!nextSong) {
      void refetch();
    }
  }, [nextSong, refetch]);

  useEffect(() => {
    if (currentSong) {
      audioRef.current = new Audio(
        URL.createObjectURL(b64toBlob(currentSong.songBlob, "audio/mp3")),
      );
      audioRef.current.loop = false;
      audioRef.current.volume = volume.current;
      audioRef.current.play().catch((err) => {
        console.error(err);
      });
    }

    return () => {
      if (audioRef.current) {
        const src = audioRef.current.src;
        audioRef.current.pause();
        URL.revokeObjectURL(src);
      }
    };
  }, [currentSong]);

  const playNextSong = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (nextSong) {
      setCurrentSong(nextSong);
      setNextSong(null);
    } else {
      setCurrentSong(null);
    }
    void refetch();
  };

  if (!currentSong) {
    return <EmptyPlayerComponent />;
  }

  return (
    <div className="dark w-full">
      <PlayingPlayerComponent
        key={currentSong.title}
        name={currentSong.title}
        artist={currentSong.songAuthor}
        length={currentSong.songLengthSeconds}
        image={currentSong.songThumbnail}
        getNextSongAction={playNextSong}
        isRunning={isRunning}
        stopAudioAction={stopAudio}
        playAudioAction={playAudio}
      />
    </div>
  );
}
