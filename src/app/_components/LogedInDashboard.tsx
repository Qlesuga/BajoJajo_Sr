"use client";

import Link from "next/link";
import GuideModal from "./Guide";
import { Button } from "~/shadcn/components/ui/button";

interface LogedInDashboardProps {
  userName: string;
}

const LogedInDashboard = ({ userName }: LogedInDashboardProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        <span>Logged in as {userName}</span>
      </p>
      <Button variant="destructive">
        <Link href={"/api/auth/signout"}>Log Out</Link>
      </Button>
      <div className="flex flex-col items-center">
        <Link href={"/player"}>Go To The Player</Link>
        <GuideModal />
      </div>
    </div>
  );
};

export default LogedInDashboard;
