"use client";

import { Card, CardContent, CardFooter } from "~/shadcn/components/ui/card";
import Image from "next/image";
import { Progress } from "~/shadcn/components/ui/progress";
import { useState, useEffect } from "react";
import MarqueeText from "./MarqueeText";

interface PlayingPlayerComponentProps {
  name: string;
  artist: string;
  image: string;
  length: number;
  getNextSongAction: () => void;
  isRunning: boolean;
  stopAudioAction: () => void;
  playAudioAction: () => void;
}

export default function PlayingPlayerComponent({
  name,
  artist,
  image,
  length,
  playAudioAction,
  isRunning,
  stopAudioAction,
  getNextSongAction,
}: PlayingPlayerComponentProps) {
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    setTime(0);
  }, []);

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
      getNextSongAction();
    }
  }, [time]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Card
      className="h-144 w-screen"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <CardContent className="h-full w-full p-6">
        <div className="flex h-full w-full flex-row gap-8">
          <div className="relative h-auto w-[168px]">
            <Image
              src={image || "/placeholder.svg"}
              alt="thumbnail"
              width={168}
              height={168}
              className="min-w-[168px] object-cover"
            />
          </div>
          <div className="flex flex-grow flex-col">
            <MarqueeText>{name}</MarqueeText>
            <MarqueeText>{artist}</MarqueeText>
            <div className="mt-2">
              <Progress value={(time / length) * 100} className="h-2" />
              <div className="mt-1 text-sm text-muted-foreground">{`${time}/${length}`}</div>
            </div>
          </div>
        </div>
      </CardContent>
      {process.env.NODE_ENV == "development" && (
        <CardFooter>
          <div className="flex gap-2">
            <button onClick={playAudioAction}>play</button>
            <button onClick={stopAudioAction}>stop</button>
            <button onClick={getNextSongAction}>next</button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
