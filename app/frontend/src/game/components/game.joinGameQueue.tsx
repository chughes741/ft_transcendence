import * as React from "react";
import { socket } from "src/contexts/WebSocket.context";
import GameLoader from "./GameLoader";
import { Box } from "@mui/system";
import "./GameQueue.css";

/**
 * This is a button that will join the game queue.
 *
 * @returns {JSX.Element} The button.
 */
export default function JoinGameQueue() {
  const [inQueue, setInQueue] = React.useState<boolean>(false);

  /** Join game queue callback */
  const joinQueue = () => {
    setInQueue(true);
    console.log("joinGameQueue event emitted");
    socket.emit("joinGameQueue", {
      client_id: "",
      join_time: Date.now()
    });
  };

  return (
    <>
      {inQueue ? (
        <GameLoader setInQueue={setInQueue} />
      ) : (
        <>
          <Box className="body-page-queue">
            <Box className="bottom-background" />
            <Box
              className="join-queue"
              onClick={joinQueue}
            >
              Join Queue
            </Box>
          </Box>
        </>
      )}
    </>
  );
}
