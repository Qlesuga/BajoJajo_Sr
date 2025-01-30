"use client";

import { Card, CardBody, Progress } from "@heroui/react";
import { Image } from "@heroui/react";
import { useEffect, useState } from "react";
import "~/styles/player.css";
import { api } from "~/trpc/react";

function Player() {
  const { data, refetch } = api.post.getSecretMessage.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const [time, setTime] = useState(0);
  useEffect(() => {
    setTimeout(() => setTime(time + 1), 1000);
  });
  console.log(data);
  return (
    <div className="w-full dark">
      <Card
        className="w-screen"
        shadow="none"
        isBlurred
        style={{ backgroundColor: "hsl(var(--heroui-background))" }}
      >
        <CardBody className="h-full w-full">
          <div className="flex h-full w-full flex-row gap-8">
            <Image src="/test_thumbnail.jpg" alt="thumbnail" width={98} />
            <div className="flex flex-grow flex-col">
              <p>duvet</p>
              <p>boa</p>
              <Progress
                aria-label="Progress"
                showValueLabel={true}
                value={time}
                size="md"
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Player;
