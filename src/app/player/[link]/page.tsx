"use client";

import "~/styles/player.css";
import { api } from "~/trpc/react";
import PlayerComponent from "../../_components/playerComponent";
import { b64toBlob } from "~/utils/stringB64ToBlob";
import { useEffect, useState, useRef } from "react";
import type { MutableRefObject } from "react";
import { useParams } from "next/navigation";

interface ISong {
  songTitle: string;
  songAuthor: string;
  songLength: number;
  songThumbnail: string;
  songBlob: string;
}

const Player: React.FC = () => {
  const params = useParams<{ link: string }>();
  const userLink = useRef(params.link);
  console.log(userLink.current);
  const [currentSong, setCurrentSong] = useState<ISong | null>(null);
  const [nextSong, setNextSong] = useState<ISong | null>(null);
  const audioRef = useRef<HTMLAudioElement | undefined>();

  const { data, refetch } = api.song.nextSong.useQuery(userLink.current, {
    enabled: true,
  });

  api.song.songSubscription.useSubscription(userLink.current, {
    onData: (data) => {
      console.log(data);
      if (data.type == "skip") {
        playNextSong();
      } else if (data.type == "new_song") {
        if (!nextSong) {
          void refetch();
        }
      }
    },
  });

  useEffect(() => {
    if (data) {
      if (!currentSong) {
        setCurrentSong(data);
      } else if (!nextSong && data.songTitle !== currentSong.songTitle) {
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
      audioRef.current.volume = 0.2;
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
    return <div className="w-full dark">Loading or empty queue</div>;
  }

  return (
    <div className="w-full dark">
      <PlayerComponent
        key={currentSong.songTitle}
        name={currentSong.songTitle}
        artist={currentSong.songAuthor}
        length={currentSong.songLength}
        image={currentSong.songThumbnail}
        audio={audioRef as MutableRefObject<HTMLAudioElement>}
        getNextSong={playNextSong}
      />
    </div>
  );
};

export default Player;
