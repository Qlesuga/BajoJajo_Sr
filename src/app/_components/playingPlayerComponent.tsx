"use client";

import Image from "next/image";
import { Progress } from "~/shadcn/components/ui/progress";
import { useState, useEffect } from "react";
import MarqueeText from "./MarqueeText";

interface PlayingPlayerComponentProps {
  name: string;
  artist: string;
  image: string;
  length: number;
  isRunning: boolean;
}

export default function PlayingPlayerComponent({
  name,
  artist,
  image,
  length,
  isRunning,
}: PlayingPlayerComponentProps) {
  const [time, setTime] = useState<number>(0);

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

  return (
    <div className="flex h-full w-full flex-row gap-8">
      <div className="relative h-[95] w-[168px]">
        <Image
          src={image || "/placeholder.svg"}
          alt="thumbnail"
          width={168}
          height={95}
          className="h-[95px] min-w-[168px] object-cover"
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
  );
}
