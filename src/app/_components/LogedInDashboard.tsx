"use client";

import Link from "next/link";
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
      <div className="flex flex-col items-center">
        <Link href={"/player"}>Go To The Player</Link>
      </div>
      <Button variant="destructive">
        <Link href={"/api/auth/signout"}>Log Out</Link>
      </Button>
    </div>
  );
};

export default LogedInDashboard;
