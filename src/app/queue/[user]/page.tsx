import SongTable from "~/app/_components/songTable";
import { auth } from "~/server/auth";
import { twitchGetUserIDFromUserName } from "~/utils/twitch/twitchGetUserIDFromUserName";

async function SongList({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  const userID = await twitchGetUserIDFromUserName(user);
  if (!userID) {
    return (
      <main className="flex min-h-screen flex-col items-center bg-gray-900 pt-4 text-white">
        <h1>user not found</h1>
      </main>
    );
  }
  const session = await auth();
  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-2xl font-bold capitalize">{user} queue</h1>
      <SongTable
        userID={userID}
        showDeleteButton={session?.account.providerId == userID}
      />
    </div>
  );
}

export default SongList;
