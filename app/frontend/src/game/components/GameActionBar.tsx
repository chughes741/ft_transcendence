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
        alignItems: "center"
      }}
    >
      {/* Left Player */}
      <PlayerDetail side={"left"} />

      {/* ReadyButton component */}
      <ReadyButton side={"left"} />

      {/* Scoreboard Component */}
      <ScoreBoard />

      {/* ReadyButton component */}
      <ReadyButton side={"right"} />

      {/* Right Player */}
      <PlayerDetail side={"right"} />
    </Box>
  );
}
