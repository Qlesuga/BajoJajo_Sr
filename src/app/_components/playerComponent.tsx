"use client";

import { Card, CardBody, Progress, Image, CardFooter } from "@heroui/react";

import { useState, useEffect } from "react";
import type { MutableRefObject } from "react";
import MarqueeText from "./MarqueeText";

interface PlayerComponentProps {
  name: string;
  artist: string;
  image: string;
  length: number;
  getNextSong: () => void;
  audio: MutableRefObject<HTMLAudioElement>;
}

function PlayerComponent({
  name,
  artist,
  image,
  length,
  audio,
  getNextSong,
}: PlayerComponentProps) {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setTime(0);
  }, []);

  const playAudio = () => {
    audio.current.play().catch((e) => console.log(e));
    setIsRunning(true);
  };

  const stopAudio = () => {
    audio.current.pause();
    setIsRunning(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout = setInterval(() => {
      return;
    });
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning]);
  useEffect(() => {
    if (time >= length) {
      getNextSong();
    }
  }, [time]);
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
            <MarqueeText>{name}</MarqueeText>
            <MarqueeText>{artist}</MarqueeText>
            <Progress
              label={`${time}/${length}`}
              value={(time / length) * 100}
              size="md"
              classNames={{
                indicator: "!duration-900 !ease-linear",
              }}
            />
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <button onClick={playAudio}>play</button>
        <button onClick={stopAudio}>stop</button>
        <button onClick={getNextSong}>next</button>
      </CardFooter>
    </Card>
  );
}

export default PlayerComponent;
