import { Avatar, ToggleButton, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { LobbyCreatedDto } from "../game.types";
import { useContext } from "react";
import { GameContext } from "src/game/game.context";

export default function GameActionBar(lobby: LobbyCreatedDto) {
  const { playerReady, setPlayerReadyState } = useContext(GameContext);
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

      {/* ReadyButton component */}
      <Box sx={{ ml: 2 }}>
        <ToggleButton
          value="check"
          selected={playerReady}
          onChange={() => setPlayerReadyState(!playerReady)}
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
