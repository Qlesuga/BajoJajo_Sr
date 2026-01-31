export type AvailableEmits =
  | { type: "volume"; value: number }
  | { type: "skip"; value: string }
  | { type: "clear" | "stop" | "play" | "new_song" };
