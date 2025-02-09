"use client";

import "~/styles/player.css";
import { api } from "~/trpc/react";
import PlayerComponent from "../_components/playerComponent";
import { b64toBlob } from "~/utils/stringB64ToBlob";
function Player() {
  const { data, refetch } = api.song.nextSong.useQuery(undefined);

  /*
  api.song.songSubscription.useSubscription(undefined, {
    onData: (data) => {
      console.log("cos", data);
    },
    onError(err) {
      console.error("Subscription error:", err);
    },
    onStarted() {
      console.log("Stared");
    },
  });
*/

  return (
    <div className="w-full dark">
      {typeof data !== "undefined" && data != null ? (
        <PlayerComponent
          key={data.songTitle}
          name={data.songTitle}
          artist={data.songAuthor}
          length={data.songLength}
          image={data.songThumbnail}
          songBlobUrl={URL.createObjectURL(
            b64toBlob(data.songBlob, "audio/mp3"),
          )}
          getNextSong={refetch}
        />
      ) : (
        "Loading"
      )}
    </div>
  );
}

export default Player;
