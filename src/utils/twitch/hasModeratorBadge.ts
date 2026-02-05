import type { Badge } from "types/twitch";

export function hasModeratorBadge(badges: Badge[]) {
  let isMod = false;
  badges.forEach((badge) => {
    if (badge.set_id === "moderator" || badge.set_id === "broadcaster") {
      isMod = true;
    }
  });
  return isMod;
}

