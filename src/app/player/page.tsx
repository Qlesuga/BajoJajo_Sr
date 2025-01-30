"use client";

import { Card, CardBody, Progress } from "@heroui/react";
import { Image } from "@heroui/react";
import "~/styles/player.css";
function Player() {
  return (
    <div className="w-full dark">
      <Card
        className="w-screen"
        shadow="sm"
        isBlurred
        style={{ backgroundColor: "hsl(var(--heroui-background))" }}
      >
        <CardBody className="h-full w-full">
          <div className="flex h-full w-full flex-row gap-8">
            <Image src="/test_thumbnail.jpg" alt="thumbnail" width={98} />
            <div className="flex flex-grow flex-col">
              <p>Duvet</p>
              <p>Bôa</p>
              <Progress
                aria-label="Downloading..."
                showValueLabel={true}
                value={40}
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
