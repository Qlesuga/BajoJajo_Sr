"use client";

import { Card, CardContent } from "~/shadcn/components/ui/card";

function EmptyPlayerCOmponent() {
  return (
    <Card
      className="h-144 w-screen"
      style={{ height: "168px", backgroundColor: "hsl(var(--background))" }}
    >
      <CardContent className="h-full w-full p-6">
        <div className="flex h-full w-full flex-row gap-8">
          <div className="relative h-auto text-8xl">😢</div>
          <div className="flex flex-grow flex-col text-5xl">
            <p>Empty Song Queue</p>
            <p>Add songs with !sr</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmptyPlayerCOmponent;
