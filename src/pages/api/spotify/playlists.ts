import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import fetch from "isomorphic-fetch";

const playlists = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (session) {
    const userAccounts = await prisma?.user.findUnique({
      where: {
        id: session.user?.id,
      },
      include: {
        accounts: true,
      },
    });
    const spotifyKey = userAccounts?.accounts?.find(
      (account) => account.provider === "spotify"
    );

    if (!spotifyKey) {
      return res.status(403).json({
        error: "You do not have a Spotify account linked to your account",
      });
    }

    // Make API call to Spotify.
    const response = await (
      await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${spotifyKey.access_token}`,
          "Content-Type": "application/json",
        },
      })
    ).json();
    const trimmedPlaylists = response.items.map((playlist: any) => {
      const { id, name } = playlist;
      return {
        id,
        name,
      };
    });
    return res.status(200).json(trimmedPlaylists);
  } else {
    res.status(500).json({
      error:
        "You must be signed in to view the protected content on this page.",
    });
  }
};

export default playlists;
