import Image from "next/image";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import LogInForm from "./_components/LogInForm";
import LogedInDashboard from "./_components/LogedInDashboard";
import Footer from "./_components/Footer";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col place-content-between items-center bg-gray-900 pt-4 text-white">
        <div className="flex flex-col">
          <Image src="/smoleg.webp" alt="smoleg" width={250} height={250} />
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-4">
            <div className="flex flex-col items-center gap-2">
              {session ? (
                <LogedInDashboard userName={session.user.name ?? ""} />
              ) : (
                <LogInForm />
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </HydrateClient>
  );
}
