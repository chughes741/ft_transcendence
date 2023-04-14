import * as React from "react";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { socket } from "src/contexts/WebSocketContext";
import { useContext } from "react";
import { GameContext } from "src/game/game.context";

/**
 *
 * @returns
 */
export default function queueWait() {
  return (
    <Box>
      <CircularProgress color="success" />
      <Button
        onClick={() => {
          //Remove user from queue and set display back to default
          socket.emit("playerLeftQueue");
        }}
        variant="outlined"
      >
        Leave Queue
      </Button>
    </Box>
  );
}
