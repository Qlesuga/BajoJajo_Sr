"use client";

import Image from "next/image";
import { Clock } from "lucide-react";

import { type SongTypeWithoutBlob } from "types/song";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shadcn/components/ui/table";

interface SongTableProps {
  songs: SongTypeWithoutBlob[];
}

export default function SongTable({ songs = [] }: SongTableProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">#</TableHead>
            <TableHead className="min-w-[250px]">Title</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end">
                <Clock className="mr-1 h-4 w-4" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-8 text-center text-muted-foreground"
              >
                No songs available
              </TableCell>
            </TableRow>
          ) : (
            songs.map((song, index) => (
              <TableRow key={index} className="group hover:bg-muted/50">
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={
                          song.songThumbnail ||
                          "/placeholder.svg?height=40&width=40"
                        }
                        alt={song.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium">{song.title}</span>
                  </div>
                </TableCell>
                <TableCell>{song.songAuthor}</TableCell>
                <TableCell className="text-right">
                  {formatTime(song.songLengthSeconds)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
