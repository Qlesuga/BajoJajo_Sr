"use client";
import { Button } from "@heroui/react";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react";

const LogInForm = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xl">Log In using:</p>
      <div>
        <Button
          color="secondary"
          endContent={<FontAwesomeIcon icon={faTwitch} />}
          onPress={() => signIn("twitch")}
        >
          Twitch
        </Button>
      </div>
    </div>
  );
};

export default LogInForm;
