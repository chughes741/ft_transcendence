import Box from "@mui/material/Box";

import ReadyButton from "./game.readyButton";
import PlayerDetail from "./game.playerDetails";
import ScoreBoard from "./game.scoreboard";

/**
 * GameActionBar component
 *
 * @returns {JSX.Element}
 */
export default function GameActionBar() {
  return (
    <Box
      sx={{
        backgroundColor: "grey",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        alignContent: "space-between",
      }}
    >
      {/* Left Player */}
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          border: 1,
          borderColor: "primary.main",
          borderRadius: 1,
          alignItems: "center",
          alignContent: "space-around"
        }}
      >
        <PlayerDetail side={"left"} />
      </Box>
      {/* ReadyButton component */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <ReadyButton />
      </Box>

      {/* Scoreboard Component */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <ScoreBoard />
      </Box>

      {/* Right Player */}
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          border: 1,
          borderColor: "primary.main",
          borderRadius: 1,
          alignItems: "center",
          alignContent: "space-around"
        }}
      >
        <PlayerDetail side={"right"} />
      </Box>
    </Box>
  );
}
