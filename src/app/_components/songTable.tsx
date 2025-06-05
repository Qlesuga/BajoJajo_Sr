"use client";

import Image from "next/image";
import { Clock, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shadcn/components/ui/table";
import { api } from "~/trpc/react";
import { useToast } from "~/shadcn/hooks/use-toast";

interface SongTableProps {
  userID: string;
  showDeleteButton?: boolean;
}

export default function SongTable({
  userID,
  showDeleteButton = false,
}: SongTableProps) {
  const { toast } = useToast();
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  const { data, refetch } = api.song.getAllSongs.useQuery(userID, {
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
  const songs = data;

  const removeSongFromQueue = api.song.removeSongFromQueue.useMutation({
    onSuccess: () => {
      toast({
        description: "Successfully removed song from queue",
      });
      void refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: `Failed to remove song from queue: ${error.message}`,
      });
      void refetch();
    },
  });
  if (!songs) {
    return <div className="rounded-md border">Loading...</div>;
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">#</TableHead>
            <TableHead className="min-w-[250px]">Title</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Added By</TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end">
                <Clock className="mr-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead></TableHead>
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
                        src={song.songThumbnail}
                        alt={song.songID}
                        sizes="40px"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium">
                      <a
                        href={`https://www.youtube.com/watch?v=${song.songID}`}
                      >
                        {song.title}
                      </a>
                    </span>
                  </div>
                </TableCell>
                <TableCell>{song.songAuthor}</TableCell>
                <TableCell>{song.addedBy}</TableCell>
                <TableCell className="text-right">
                  {formatTime(song.songLengthSeconds)}
                </TableCell>
                {showDeleteButton && (
                  <TableCell className="text-right">
                    <button
                      onClick={() =>
                        removeSongFromQueue.mutate({
                          songID: song.songID,
                          songIndex: index,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
