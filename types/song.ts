export type SongType = {
  songID: string;
  title: string;
  songLengthSeconds: number;
  songAuthor: string;
  songThumbnail: string;
};

export type SongQueueElementType = {
  songID: string;
  addedBy: string;
};

export type SongTypeInRedis = {
  title: string;
  songLengthSeconds: number;
  songAuthor: string;
  songThumbnail: string;
};
export type SongTypeWithAddedBy = SongType & {
  addedBy: string;
};
