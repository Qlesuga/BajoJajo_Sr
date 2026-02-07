"use server";

import Player from "./_components/Player";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const settings = await api.song.getPlayerSettings();
  const currentSong = await api.song.getCurrentSong();
  return (
    <Player
      initCurrentSong={currentSong!.songID}
      initVolumeInPercentage={settings!.volumeInPercentage}
    />
  );
}
