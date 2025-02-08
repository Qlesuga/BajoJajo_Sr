"use client";

import { Card, CardBody, Progress, Image, CardFooter } from "@heroui/react";

import { useState, useRef, useEffect } from "react";
interface PlayerComponentProps {
  name: string;
  artist: string;
  image: string;
  length: number;
  songBlobUrl: string;
  getNextSong: () => Promise<any>;
}

function PlayerComponent({
  name,
  artist,
  image,
  length,
  songBlobUrl,
  getNextSong,
}: PlayerComponentProps) {
  const audio = useRef(new Audio(songBlobUrl));
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  audio.current.loop = false;

  const playAudio = () => {
    audio.current.play().catch((e) => console.log(e));
    setIsRunning(true);
  };
  const stopAudio = () => {
    audio.current.pause();
    setIsRunning(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning]);
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
              classNames={{ indicator: "!duration-900 !ease-linear" }}
            />
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <button onClick={playAudio}>play</button>
        <button onClick={stopAudio}>stop</button>
        <button
          onClick={() => {
            getNextSong().catch((e) => {
              console.error(e);
            });
          }}
        >
          next
        </button>
      </CardFooter>
    </Card>
  );
}

export default PlayerComponent;
