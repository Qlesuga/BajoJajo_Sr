"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/components/ui/dialog";

export default function GuideModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p className="cursor-pointer">guide</p>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            OBS Player Setup Guide
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h1>WIP</h1>
            <p>just open it in your browser</p>
            {/*
            <h3 className="text-lg font-medium">
              Step 1: Copy your player link
            </h3>
            <p className="text-muted-foreground">
              Copy your player link but be careful not to share it publicly
            </p>
            <div className="overflow-hidden rounded-md border">
              <Image
                src="/Guide1.jpg"
                alt="Copy player link"
                width={1280}
                height={720}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              Step 2: Add new browser source in OBS
            </h3>
            <p className="text-muted-foreground">
              In OBS, add a new browser source to your scene
            </p>
            <div className="overflow-hidden rounded-md border">
              <Image
                src="/Guide2.jpg"
                alt="Add browser source"
                width={1280}
                height={720}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              Step 3: Configure the browser source
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Paste your player link into the URL field</li>
              <li>Set the width to your preferred size</li>
              <li>Set the height to 128</li>
              <li>Make sure to check &quot;Control audio via OBS&quot;</li>
            </ul>
            <div className="overflow-hidden rounded-md border">
              <Image
                src="/Guide3.jpg"
                alt="Configure browser source"
                width={1280}
                height={720}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              Step 4: Set up audio monitoring
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Open advanced audio properties</li>
              <li>
                Set audio monitoring for the player to &quot;Monitor and
                Output&quot;
              </li>
            </ul>
            <div className="overflow-hidden rounded-md border">
              <Image
                src="/Guide4.jpg"
                alt="Set up audio monitoring"
                width={1280}
                height={720}
                className="w-full"
              />
            </div>
          */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
