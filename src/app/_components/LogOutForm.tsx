"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

const LogOutForm = () => {
  return (
    <Button color="danger">
      <Link
        href={"/api/auth/signout"}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        Log Out
      </Link>
    </Button>
  );
};

export default LogOutForm;
