"use client";

import "~/styles/player.css";
import { api } from "~/trpc/react";
import PlayerComponent from "../../_components/playerComponent";
import { b64toBlob } from "~/utils/stringB64ToBlob";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import type { SongType } from "types/song";
import { type AvailableEmits } from "types/subscriptedUsers";

const Player: React.FC = () => {
  const params = useParams<{ link: string }>();
  const userLink = useRef(params.link);
  const [currentSong, setCurrentSong] = useState<SongType | null>(null);
  const [nextSong, setNextSong] = useState<SongType | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | undefined>(null);
  const volume = useRef<number>(0.2);
  const { data, refetch } = api.song.nextSong.useQuery(userLink.current, {
    enabled: true,
  });

  api.song.songSubscription.useSubscription(userLink.current, {
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
    return <div className="dark w-full">Loading or empty queue</div>;
  }

  return (
    <div className="dark w-full">
      <PlayerComponent
        key={currentSong.title}
        name={currentSong.title}
        artist={currentSong.songAuthor}
        length={currentSong.songLengthSeconds}
        image={currentSong.songThumbnail}
        getNextSong={playNextSong}
        isRunning={isRunning}
        stopAudio={stopAudio}
        playAudio={playAudio}
      />
    </div>
  );
};

export default Player;
