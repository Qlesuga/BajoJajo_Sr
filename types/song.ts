export interface ISongWithoutBlob {
  title: string;
  songLengthSeconds: number;
  songAuthor: string;
  songThumbnail: string;
}

export interface ISong extends ISongWithoutBlob {
  songBlob: string;
}
