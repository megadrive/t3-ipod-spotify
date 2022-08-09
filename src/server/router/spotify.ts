import { createProtectedRouter } from "./protected-router";
import fetch from "isomorphic-fetch";

// Example router with queries that can only be hit if the user requesting is signed in
export const spotifyRouter = createProtectedRouter().query("get-playlists", {
  async resolve({ ctx }) {
    console.log("origin??", ctx.req?.headers.origin);
    const playlists = await (
      await fetch(ctx.req?.headers.origin + "/api/spotify/playlists")
    ).json();

    return playlists;
  },
});
