"use client";

import { type AvailableEmits } from "types/subscriptedUsers";

export type SubscriptedListeners = Record<
  AvailableEmits["type"],
  Array<(event: AvailableEmits) => void>
>;

