import Box from "@mui/material/Box";
import { useGameViewModelContext } from "../game.viewModel";
import LoadingPage from "./game.loadingPage";
import "./game.joinGameQueue.tsx.css";

/**
 * This is a button that will join the game queue.
 *
 * @returns {JSX.Element} The button.
 */
export default function JoinGameQueue() {
  const { joinGameQueue, inQueue } = useGameViewModelContext();

  return (
    <>
      {inQueue ? (
        <LoadingPage />
      ) : (
        <>
          <Box className="body-page-queue">
            <Box className="bottom-background" />
            <Box
              className="join-queue"
              onClick={joinGameQueue}
            >
              Join Queue
            </Box>
          </Box>
        </>
      )}
    </>
  );
}
