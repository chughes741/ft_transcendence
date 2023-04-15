import * as React from "react";
import { Button } from "@mui/material";
import { socket } from "src/contexts/WebSocket.context";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useRootViewModelContext } from "src/root.context";
import { GameEvents } from "kingpong-lib";


/**
 * This is a button that will join the game queue.
 *
 * @returns {JSX.Element} The button.
 */
export default function JoinGameQueue() {
  const { self } = useRootViewModelContext();

  const [inQueue, setInQueue] = React.useState<boolean>(false);

  /** Join game queue callback */
  const joinQueue = () => {
    console.log("joinGameQueue event emitted");

    socket.emit(
      GameEvents.JoinGameQueue,
      {
        username: self.username,
        join_time: Date.now()
      },
      () => {
        setInQueue(true);
      }
    );
  };

  /** Leave game queue callback */
  const leaveQueue = () => {
    setInQueue(false);
    socket.emit(GameEvents.LeaveGameQueue, {
      username: self.username
    });
  };

  return (
    <Box
      sx={{
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {inQueue ? (
        <>
          <Button
            onClick={leaveQueue}
            variant="outlined"
            color="error"
          >
            Leave Queue
          </Button>
          <CircularProgress sx={{ mt: 2 }} />
        </>
      ) : (
        <>
          <Button
            onClick={joinQueue}
            variant="outlined"
            color="success"
          >
            Join Queue
          </Button>
        </>
      )}
    </Box>
  );
}
