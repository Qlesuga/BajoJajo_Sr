"use client";

import { Card, CardBody, Progress, Image } from "@heroui/react";

import { useState } from "react";
interface PlayerComponentProps {
  name: string;
  artist: string;
  image: string;
  length: number;
  songBlobUrl: string;
}

function PlayerComponent({
  name = "Duvet",
  artist = "Boa",
  image = "/test_thumbnail.jpg",
  length = 20,
  songBlobUrl,
}: PlayerComponentProps) {
  const [time, setTime] = useState(0);
  const timer = setTimeout(() => {
    setTime(time + 1);
  }, 1000);
  if (time >= length) {
    clearTimeout(timer);
  }
  return (
    <Card
      className="h-144 w-screen"
      shadow="none"
      isBlurred
      style={{ backgroundColor: "hsl(var(--heroui-background))" }}
    >
      <CardBody className="h-full w-full">
        <div className="flex h-full w-full flex-row gap-8">
          <Image src={image} alt="thumbnail" width={168} />
          <div className="flex flex-grow flex-col">
            <p>{name}</p>
            <p>{artist}</p>
            <Progress
              label={`${time}/${length}`}
              value={(time / length) * 100}
              size="md"
            />
          </div>
        </div>
      </CardBody>
      <audio controls={true} src={songBlobUrl} />
    </Card>
  );
}

export default PlayerComponent;
