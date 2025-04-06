export type AvailableEmits =
  | { type: "volume"; value: number }
  | { type: "clear" | "stop" | "skip" | "play" | "new_song" };
