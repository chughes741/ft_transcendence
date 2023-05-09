import Box from "@mui/material/Box";

import ReadyButton from "./game.readyButton";
import PlayerDetail from "./game.playerDetails";
import ScoreBoard from "./game.scoreboard";
import { useState } from "react";
import { useGameViewModelContext } from "../game.viewModel";

/**
 * GameActionBar component
 *
 * @returns {JSX.Element}
 */

export default function GameActionBar() {
  const { displayGame } = useGameViewModelContext();
  return (
    <Box
      sx={{
        backgroundColor: "#8f8f8f",
        height: "5vh",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem"
      }}
    >
      {/* Left Player */}
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          border: 1,
          borderColor: "#9EF8EE",
          color: "#F24404",
          borderRadius: 1,
          alignItems: "center",
          justifyContent: "space-around"
        }}
      >
        <PlayerDetail side={"left"} />
      </Box>

      {/* ReadyButton component  Or  ScoreComponent*/}

      <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "center" }}>
        {(!displayGame && <ReadyButton />) || <ScoreBoard />}
      </Box>
      {/* Right Player */}
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          border: 1,
          borderColor: "#9EF8EE",
          color: "#F24404",
          borderRadius: 1,
          alignItems: "center",
          justifyContent: "space-around"
        }}
      >
        <PlayerDetail side={"right"} />
      </Box>
    </Box>
  );
}
