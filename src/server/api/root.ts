import { songRouterOLD } from "~/server/api/routers/songOLD";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { admingRouter } from "./routers/admin";
import { songRouter } from "./routers/song";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  song: songRouter,
  songOld: songRouterOLD,
  admin: admingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
