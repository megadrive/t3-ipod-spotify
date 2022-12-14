import { env } from "../../env/server.mjs";
import { createProtectedRouter } from "./protected-router";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedSessionRouter = createProtectedRouter()
  .query("get-session", {
    resolve({ ctx }) {
      return ctx.session;
    },
  })
  .mutation("logout-user", {
    async resolve({ ctx }) {
      await fetch(env.NEXTAUTH_URL + "/api/auth/signout", {
        method: "post",
      });

      return true;
    },
  });
