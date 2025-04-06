export type AvailableEmits =
  | { type: "volume"; value: number }
  | { type: "stop" | "skip" | "play" | "new_song" };
