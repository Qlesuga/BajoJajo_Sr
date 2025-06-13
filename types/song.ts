export type SongTypeWithoutBlob = {
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

export type SongType = SongTypeWithoutBlob & {
  songBlob: string;
};

export type SongTypeInRedis = {
  title: string;
  songLengthSeconds: number;
  songAuthor: string;
  songThumbnail: string;
};
export type allSongInfo = SongTypeWithoutBlob & {
  addedBy: string;
  songID: string;
};
