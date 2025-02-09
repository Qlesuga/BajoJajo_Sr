"use client";

import "~/styles/player.css";
import { api } from "~/trpc/react";
import PlayerComponent from "../_components/playerComponent";
import { b64toBlob } from "~/utils/stringB64ToBlob";
import { useEffect, useState, useRef } from "react";

function Player() {
  const [songQueue, setSongQueue] = useState([]);
  const { data, refetch } = api.song.nextSong.useQuery(undefined);

  const audio = useRef<HTMLAudioElement>();

  useEffect(() => {
    if (data && !songQueue.some((song) => song.songTitle === data.songTitle)) {
      setSongQueue((prevQueue) => [...prevQueue, data].slice(-2));
    }
  }, [data]);

  useEffect(() => {
    if (songQueue.length < 2) {
      refetch();
    }
    if (songQueue.length > 0) {
      audio.current = new Audio(
        URL.createObjectURL(b64toBlob(songQueue[0].songBlob, "audio/mp3")),
      );
      audio.current.loop = false;
    }
  }, [songQueue, refetch]);

  const playNextSong = () => {
    if (songQueue.length > 0) {
      audio.current?.pause();
    }
    setSongQueue((prevQueue) => prevQueue.slice(1));
    refetch();
  };

  return (
    <div className="w-full dark">
      {songQueue.length > 0 ? (
        <PlayerComponent
          key={songQueue[0].songTitle}
          name={songQueue[0].songTitle}
          artist={songQueue[0].songAuthor}
          length={songQueue[0].songLength}
          image={songQueue[0].songThumbnail}
          audio={audio}
          getNextSong={playNextSong}
        />
      ) : (
        "Loading"
      )}
    </div>
  );
}

export default Player;
