import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import type { Session } from "next-auth";
import { trpc } from "../utils/trpc";
import React, { ChangeEventHandler, useRef, useState } from "react";
import { useRouter } from "next/router";

interface PlayProps {
  session: Session;
}

const PhoneMockup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="m-auto">
      <div className="mockup-phone">
        <div className="camera"></div>
        <div className="display">
          <div className="artboard artboard-demo phone-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

interface SpotifyPlaylist {
  id: string;
  name: string;
}

const Play: NextPage<PlayProps> = () => {
  const spotify = trpc.useQuery(["spotify.get-playlists"]);
  console.log(spotify.isError, spotify.error);

  const [playlist, setPlaylist] = useState<SpotifyPlaylist>();
  const [canPlay, setCanPlay] = useState(false);
  const onSelectChanged: ChangeEventHandler<HTMLSelectElement> = (e) => {
    console.log(e.target.value);
    setCanPlay(true);
  };

  const startGame = () => {
    return null;
  };

  return (
    <PhoneMockup>
      {spotify.isLoading ? (
        <>Loading..</>
      ) : (
        <>
          <select
            onChange={onSelectChanged}
            className="select select-bordered w-full max-w-xs"
            defaultValue="unselected"
          >
            <option disabled value="unselected">
              Pick a playlist to begin
            </option>
            {spotify.data?.map((playlist: any) => (
              <option key={playlist.id} defaultValue={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
          <button
            className="btn w-full mt-3"
            disabled={!canPlay}
            onClick={startGame}
          >
            Play!
          </button>
        </>
      )}
    </PhoneMockup>
  );
};

export const getServerSideProps: GetServerSideProps<PlayProps> = async (
  context
) => {
  const { req, res } = context;

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default Play;
