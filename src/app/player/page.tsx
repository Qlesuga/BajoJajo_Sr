"use client";

import "~/styles/player.css";
import { api } from "~/trpc/react";
import PlayerComponent from "../_components/playerComponent";
import { b64toBlob } from "~/utils/stringB64ToBlob";
import { useEffect, useState, useRef } from "react";
import type { MutableRefObject } from "react";
interface ISong {
  songTitle: string;
  songAuthor: string;
  songLength: number;
  songThumbnail: string;
  songBlob: string;
}

const Player: React.FC = () => {
  const [songQueue, setSongQueue] = useState<ISong[]>([]);
  const { data, refetch } = api.song.nextSong.useQuery(undefined, {
    enabled: true,
  });

  // Use MutableRefObject since the audio reference will be mutated
  const audioRef = useRef<HTMLAudioElement | undefined>();

  useEffect(() => {
    if (data && !songQueue.some((song) => song.songTitle === data.songTitle)) {
      setSongQueue((prevQueue) => [...prevQueue, data].slice(-2));
    }
  }, [data]);

  useEffect(() => {
    if (songQueue.length < 2) {
      void refetch();
    }
    if (songQueue.length > 0) {
      audioRef.current = new Audio(
        URL.createObjectURL(b64toBlob(songQueue[0]!.songBlob, "audio/mp3")),
      );
      audioRef.current.loop = false;
    }

    // Cleanup function to revoke object URL and stop audio
    return () => {
      if (audioRef.current) {
        const src = audioRef.current.src;
        audioRef.current.pause();
        URL.revokeObjectURL(src);
      }
    };
  }, [songQueue, refetch]);

  const playNextSong = (): void => {
    if (songQueue.length > 0 && audioRef.current) {
      audioRef.current.pause();
    }
    setSongQueue((prevQueue) => prevQueue.slice(1));
    void refetch();
  };

  if (
    songQueue.length === 0 ||
    !audioRef.current ||
    songQueue[0] === undefined
  ) {
    return <div className="w-full dark">Loading</div>;
  }

  return (
    <div className="w-full dark">
      <PlayerComponent
        key={songQueue[0].songTitle}
        name={songQueue[0].songTitle}
        artist={songQueue[0].songAuthor}
        length={songQueue[0].songLength}
        image={songQueue[0].songThumbnail}
        audio={audioRef as MutableRefObject<HTMLAudioElement>}
        getNextSong={playNextSong}
      />
    </div>
  );
};

export default Player;
