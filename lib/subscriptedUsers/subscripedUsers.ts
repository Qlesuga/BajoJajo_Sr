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

// Ensuring globalThis is properly .
const globalThis = global as unknown as typeof global & {
  [GLOBAL_KEY]?: GlobalStore;
};

const GLOBAL_KEY = "__SUBSCRIPTED_USERS_STORE__";

if (!globalThis[GLOBAL_KEY]) {
  globalThis[GLOBAL_KEY] = {
    users: {} as Record<string, ISubscriptedUser>,
    id: randomUUID(),
  };
}

export function getSubscriptedUsers(): Record<string, ISubscriptedUser> {
  const store = globalThis[GLOBAL_KEY];
  return store!.users;
}

export function emitToSubscriptedUser(
  userID: string,
  data: AvailableEmits,
): null {
  getSubscriptedUsers()[userID]?.eventEmitter.emit("emit", data);
  return null;
}
