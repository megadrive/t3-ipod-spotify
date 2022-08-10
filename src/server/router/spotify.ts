import { createProtectedRouter } from "./protected-router";
import fetch from "isomorphic-fetch";
import { TRPCError } from "@trpc/server";
import { Account } from "@prisma/client";

// Example router with queries that can only be hit if the user requesting is signed in
export const spotifyRouter = createProtectedRouter().query("get-playlists", {
  async resolve({ ctx }) {
    const { prisma, session } = ctx;

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        accounts: true,
      },
    });

    const accounts = user?.accounts.filter(
      (account) => account.provider === "spotify"
    );

    const spotify = accounts && accounts[0] ? accounts[0] : null;
    if (!spotify) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        cause: "SpotifyTokenError",
        message: "No Spotify account token.",
      });
    }

    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${spotify.access_token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status === 401) {
      // Sign the user out
      console.log("Attempting to sign the user out");
      await fetch(
        ctx.req?.headers.origin ??
          "http://localhost:3000/" + "/api/auth/signout",
        {
          method: "POST",
        }
      );
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Bad token, reauthenticate.",
        cause: "token",
      });
    } else if (response.status === 403) {
      // Bad OAuth request.
      throw new TRPCError({
        code: "BAD_REQUEST",
      });
    } else if (response.status === 429) {
      // Exceeded rate limits
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Rate limit has been hit.",
      });
    }

    const data: { items: { id: string; name: string }[] } =
      await response.json();

    return data.items.map((playlist) => {
      const { id, name } = playlist;
      return {
        id,
        name,
      };
    });
  },
});
