"use client";

import "~/styles/player.css";
import { api } from "~/trpc/react";
import PlayerComponent from "../_components/playerComponent";

function Player() {
  //const { data } = api.song.nextSong.useQuery(undefined);
  const test = api.song.songSubscription.useSubscription(undefined, {
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
  const b64toBlob = (b64Data: string, contentType = "", sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  return (
    <div className="w-full dark">
      {typeof data !== "undefined" ? (
        <PlayerComponent
          name={data.songTitle}
          artist={data.songAuthor}
          length={data.songLength}
          image={data.songThumbnail}
          songBlobUrl={URL.createObjectURL(
            b64toBlob(data.songBlob, "audio/mp3"),
          )}
        />
      ) : (
        "Loading"
      )}
    </div>
  );
}

export default Player;
