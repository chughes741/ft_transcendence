import * as React from "react";
import { Button } from "@mui/material";
import { socket } from "src/contexts/WebSocket.context";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

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

  /** Leave game queue callback */
  const leaveQueue = () => {
    /** @todo emit leaveQueue message */
    setInQueue(false);
  };

  /** Invite player to lobby callback */
  const invitePlayerToLobby = () => {
    /** @todo player invite functionality  */
    return;
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
          <Button
            onClick={invitePlayerToLobby}
            sx={{ mt: 2 }}
            variant="outlined"
            color="success"
          >
            Invite Player
          </Button>
        </>
      )}
    </Box>
  );
}
