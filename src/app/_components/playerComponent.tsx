"use client";

import { Card, CardBody, Progress, Image, CardFooter } from "@heroui/react";

import { useState, useRef } from "react";
interface PlayerComponentProps {
  name: string;
  artist: string;
  image: string;
  length: number;
  songBlobUrl: string;
}

function PlayerComponent({
  name,
  artist,
  image,
  length,
  songBlobUrl,
}: PlayerComponentProps) {
  const audio = useRef(new Audio(songBlobUrl));
  audio.current.loop = false;
  const playAudio = () => {
    audio.current.play().catch((e) => console.log(e));
  };
  const stopAudio = () => {
    audio.current.pause();
  };
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
      <CardFooter>
        <button onClick={playAudio}>play</button>
        <button onClick={stopAudio}>stop</button>
      </CardFooter>
    </Card>
  );
}

export default PlayerComponent;
