"use server";

import PlayerComponent from "~/app/_components/playerComponents";
import { api } from "~/trpc/server";

export default async function Player({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  const link = (await params).link;
  const settings = await api.songOld.getPlayerSettings(link);
  const currentSong = await api.songOld.getCurrentSong(link);
  const nextSong = await api.songOld.getNextSong(link);
  if (!settings) {
    return <div>failed to load player settings</div>;
  }
  return (
    <PlayerComponent
      initCurrentSong={currentSong}
      initNextSong={nextSong}
      initVolumeInPercentage={settings.volumeInPercentage}
    />
  );
}
