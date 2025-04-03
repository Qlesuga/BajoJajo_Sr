"use client";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react";
import { Button } from "~/shadcn/components/ui/button";

const LogInForm = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xl">Log In using:</p>
      <div>
        <Button
          className="bg-twitch text-white"
          onClick={() => signIn("twitch")}
        >
          <FontAwesomeIcon icon={faTwitch} />
          Twitch
        </Button>
      </div>
    </div>
  );
};

export default LogInForm;
