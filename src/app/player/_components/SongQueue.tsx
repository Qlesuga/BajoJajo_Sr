import { ScrollArea } from "~/shadcn/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shadcn/components/ui/table";
import Image from "next/image";
import { Ban, Trash2 } from "lucide-react";
import MarqueeText from "~/app/_components/MarqueeText";
import { type SongTypeWithAddedBy } from "types/song";
import { api } from "~/trpc/react";
import { useToast } from "~/shadcn/hooks/use-toast";

type SongQueueProps = {
  Queue?: SongTypeWithAddedBy[];
};

export default function SongQueue({ Queue }: SongQueueProps) {
  const { toast } = useToast();
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const { mutate: removeSongFromQueue } =
    api.song.removeSongFromQueue.useMutation({
      onSuccess: () => {
        toast({
          description: "Successfully removed song from queue",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          description: `Failed to remove song from queue: ${error.message}`,
        });
      },
    });

  return (
    <ScrollArea className="h-full w-full rounded-md border-none">
      <Table noWrapper={true}>
        <TableHeader className="border-1 sticky top-0 z-10 border-b-white bg-[var(--card)]">
          <TableRow>
            <TableHead className="px-2 py-1">#</TableHead>
            <TableHead className="max-w-md px-2 py-1">
              Title <span className="text-xs">(hover to scroll)</span>
            </TableHead>
            <TableHead className="px-2 py-1">Channel</TableHead>
            <TableHead className="px-2 py-1">Added By</TableHead>
            <TableHead className="px-2 py-1">Length</TableHead>
            <TableHead className="px-2 py-1">Remove</TableHead>
            <TableHead className="px-2 py-1">Ban</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="border-none">
          {Queue?.map((song, index) => {
            return (
              <TableRow className="px-2 py-1" key={index}>
                <TableCell className="px-2 py-1">{index + 1}</TableCell>
                <TableCell className="max-w-[200px]">
                  <div className="flex max-w-sm items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={song.songThumbnail}
                        alt="mikumiku"
                        sizes="40px"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="w-[calc(100%-3.5rem)] font-medium">
                      <a
                        href={`https://www.youtube.com/watch?v=${song.songID}`}
                        target="_blank"
                      >
                        <MarqueeText shouldAnimateOnlyOnHover>
                          {song.title}
                        </MarqueeText>
                      </a>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-2 py-1">
                  <MarqueeText shouldAnimateOnlyOnHover>
                    {song.songAuthor}
                  </MarqueeText>
                </TableCell>
                <TableCell className="px-2 py-1">{song.addedBy}</TableCell>
                <TableCell className="px-2 py-1">
                  {formatTime(song.songLengthSeconds)}
                </TableCell>
                <TableCell className="justify-center px-2 py-1">
                  <Trash2
                    className="m-auto block h-6 w-6 cursor-pointer"
                    onClick={() =>
                      removeSongFromQueue({
                        songID: song.songID,
                        songIndex: index,
                      })
                    }
                  />
                </TableCell>

                <TableCell className="px-2 py-1">
                  <Ban className="m-auto block h-6 w-6" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
