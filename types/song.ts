export type SongTypeWithoutBlob = {
  title: string;
  songLengthSeconds: number;
  songAuthor: string;
  songThumbnail: string;
};

export type SongType = SongTypeWithoutBlob & {
  songBlob: string;
};

export type SongTypeInRedis = SongTypeWithoutBlob;
