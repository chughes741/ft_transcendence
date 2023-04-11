//This will return a name and ready status for a single player
import * as React from "react";
import {
  Avatar,
  IconButton,
  ToggleButton,
  Typography,
  useTheme
} from "@mui/material";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ThemeProvider } from "@mui/material";
import { socket } from "src/contexts/WebSocketContext";
import { LobbyCreatedDto } from "../game.types";
import { useContext } from "react";
import { GameContext } from "src/game/game.context";
import * as GameTypes from "../game.types";
//If the player is the current user, it will have a toggleable button for ready status
//If the player is the opposing user, it will have a badge that shows opponents ready status

//Need to know which side each player is on, so both ready buttons can be in the middle

export default function GameActionBar(lobby: LobbyCreatedDto) {
  const {playerReady, setPlayerState} = useContext(GameContext);
  console.log(lobby);
  return (
    <Box
      sx={{
        backgroundColor: "grey",
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      {/* Avatar component */}
      <Box>
        <Avatar></Avatar>
      </Box>

      <Box sx={{ ml: 1 }}>
        <Typography>Joe Blow</Typography>
      </Box>

      {/* Readybutton component */}
      <Box sx={{ ml: 2 }}>
        <ToggleButton
          value="check"
          selected={playerReady}
          onChange={() =>  setPlayerState(!playerReady)}
        >
          <CheckCircleIcon />
        </ToggleButton>
      </Box>

      {/* Scoreboard Component */}
      <Box sx={{ flexGrow: 0, alignItems: "space-around" }}>
        <Typography>Score: 2 | 0</Typography>
      </Box>

      {/* Avatar component */}
      <Box sx={{}}>
        <Avatar></Avatar>
      </Box>

      <Box sx={{ ml: 1 }}>
        <Typography>Joe Blow</Typography>
      </Box>
    </Box>
  );
}
