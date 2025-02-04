import Image from "next/image";
import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import LogInForm from "./_components/LogInForm";
import LogOutForm from "./_components/LogOutForm";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <Image src="/smoleg.webp" alt="smoleg" width={250} height={250} />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              {session ? <LogOutForm /> : <LogInForm />}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
