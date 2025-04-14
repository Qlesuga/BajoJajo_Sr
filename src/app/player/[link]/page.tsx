import PlayerComponent from "~/app/_components/playerComponents";
import { api } from "~/trpc/server";

export default async function Player({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  const link = (await params).link;
  const settings = await api.song.getPlayerSettings(link);
  const currentSong = await api.song.getCurrentSong(link);
  const nextSong = await api.song.getNextSong(link);
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
