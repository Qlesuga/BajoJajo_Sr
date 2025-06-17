"use client";

export default function EmptyPlayerComponent() {
  return (
    <div className="flex h-full w-full flex-row gap-8">
      <div className="relative h-auto text-8xl">😢</div>
      <div className="flex flex-grow flex-col text-5xl">
        <p>Empty Song Queue</p>
        <p>Add songs with !sr</p>
      </div>
    </div>
  );
}
