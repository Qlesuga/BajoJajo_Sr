import type { Badge } from "types/twitch";

export function hasBroadcasterBadge(badges: Badge[]) {
  let isBroadcaster = false;
  badges.forEach((badge) => {
    if (badge.set_id === "broadcaster") {
      isBroadcaster = true;
    }
  });
  return isBroadcaster;
}

