// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedSessionRouter } from "./session";
import { spotifyRouter } from "./spotify";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("session.", protectedSessionRouter)
  .merge("spotify.", spotifyRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
