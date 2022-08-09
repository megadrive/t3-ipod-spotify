import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import type { Session } from "next-auth";
import { trpc } from "../utils/trpc";

interface PlayProps {
  session: Session;
}

const Play: NextPage<PlayProps> = ({ session }) => {
  const spotify = trpc.useQuery(["spotify.get-playlists"]);
  console.log(spotify);

  return (
    <div className="m-auto">
      <div className="mockup-phone">
        <div className="camera"></div>
        <div className="display">
          <div className="artboard artboard-demo phone-1">
            <select
              className="select select-bordered w-full max-w-xs"
              defaultValue="unselected"
            >
              <option defaultValue="unselected" disabled>
                Pick a playlist to begin
              </option>
              {spotify.data?.map((playlist: any) => (
                <option key={playlist.id} defaultValue={playlist.id}>
                  {playlist.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
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
