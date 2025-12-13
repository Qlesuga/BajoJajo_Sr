import { randomUUID } from "crypto";
import { type EventEmitter } from "stream";
import { type AvailableEmits } from "types/subscriptedUsers";

export interface ISubscriptedUser {
  eventEmitter: EventEmitter;
}

interface GlobalStore {
  users: Record<string, ISubscriptedUser>;
  id: string;
}

const GLOBAL_KEY = "__SUBSCRIPTED_USERS_STORE__";

// Ensuring global store is properly initialized
const globalForStore = global as unknown as typeof global & {
  [GLOBAL_KEY]?: GlobalStore;
};

if (!globalForStore[GLOBAL_KEY]) {
  globalForStore[GLOBAL_KEY] = {
    users: {} as Record<string, ISubscriptedUser>,
    id: randomUUID(),
  };
}

export function getSubscriptedUsers(): Record<string, ISubscriptedUser> {
  const store = globalForStore[GLOBAL_KEY];
  return store!.users;
}

export function emitToSubscriptedUser(
  userID: string,
  data: AvailableEmits,
): null {
  getSubscriptedUsers()[userID]?.eventEmitter.emit("emit", data);
  return null;
}
