import { createProtectedRouter } from "./protected-router";
import fetch from "isomorphic-fetch";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const spotifyRouter = createProtectedRouter()
  .query("get-playlist-songs", {
    input: z.number(),
    async resolve({ ctx, input }) {
      const fakeData = [
        {
          id: 1,
          name: "Andy's super cool playlist",
          items: [{ id: 99, name: "Song 2", artist: "Blur" }],
        },
        {
          id: 2,
          name: "pee",
          items: [{ id: 99, name: "Bohemian Rhapsody", artist: "Queen" }],
        },
        {
          id: 3,
          name: "rocket emoji",
          items: [
            { id: 99, name: "Artist in the Ambulance", artist: "Thrice" },
          ],
        },
      ];

      return fakeData[input] ?? null;
    },
  })
  .query("get-playlists", {
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

      // debug information
      return [
        { id: 1, name: "Andy's super cool playlist" },
        { id: 2, name: "pee" },
        { id: 3, name: "rocket emoji" },
      ];

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
