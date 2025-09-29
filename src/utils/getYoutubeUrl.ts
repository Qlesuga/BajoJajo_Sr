export function getYouTubeUrl(videoUrlOrId: string): string | null {
  if (
    (videoUrlOrId.length > 14 &&
      videoUrlOrId.length < 256 &&
      videoUrlOrId.includes("youtube")) ||
    videoUrlOrId.includes("youtu.be")
  ) {
    const rx =
      /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]+).*/;
    const r = rx.exec(videoUrlOrId);
    if (r?.[1]) {
      return r[1];
    }
    return null;
  } else if (videoUrlOrId.length <= 14) {
    return videoUrlOrId;
  }

  return null;
}
