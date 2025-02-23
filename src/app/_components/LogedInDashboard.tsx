"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import Guide from "./Guide";

interface LogedInDashboardProps {
  userName: string;
  userLink: string;
}

const LogedInDashboard = ({ userName, userLink }: LogedInDashboardProps) => {
  const CopyPlayerLink = () => {
    const hostname = window.location.hostname;
    let link = `/player/${userLink}`;
    if (hostname == "localhost") {
      link = `http://localhost:3000${link}`;
    } else {
      link = `https://${hostname}${link}`;
    }
    navigator.clipboard.writeText(link).catch(() => {
      console.error("ERROR WHILE COPYING PLAYER LINK TO CLIPBOARD");
    });
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        <span>Logged in as {userName}</span>
      </p>
      <Button color="danger">
        <Link
          href={"/api/auth/signout"}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          Log Out
        </Link>
      </Button>
      <div className="flex flex-col items-center">
        <Button onPress={CopyPlayerLink}>COPY PLAYER LINK</Button>
        <Guide />
      </div>
    </div>
  );
};

export default LogedInDashboard;
