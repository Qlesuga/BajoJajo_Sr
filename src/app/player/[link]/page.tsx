import PlayerComponent from "~/app/_components/playerComponents";
import { api } from "~/trpc/server";

export default async function Player({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  const link = (await params).link;
  const settings = await api.song.getPlayerSettings(link);
  if (!settings) {
    return <div>failed to load player settings</div>;
  }
  return (
    <PlayerComponent initVolumeInPercentage={settings.volumeInPercentage} />
  );
}
