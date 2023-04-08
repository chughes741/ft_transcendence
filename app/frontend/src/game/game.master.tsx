import GameSideBar from "src/components/GameSideBar";
import Game from "src/game/GameWindow";
import { useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Container, CssBaseline, Typography } from "@mui/material";
import GameActionBar from "./components/GameActionBar";

export default function GameWindow() {
  return (
    // Outer wrapper for component
    <Box
      sx={{
        backgroundColor: "green",
        mt: 10,
        ml: 47,
        mr: 5,
        display: "flex",
        flexDirection: "column",
        width: 800
      }}
    >
      {/* Game canvas */}
      <Box sx={{ width: 800, height: 400, backgroundColor: "red" }}>
        <Game />
      </Box>

      {/*Secondary component wrapper for horizontal flex*/}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "space-between"
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <GameActionBar />
        </Box>
      </Box>
    </Box>
  );
}

/*
GameWindow Behaviours:

Until players ready up, the canvas area should just display the logo or buttons
Once game starts display the game and give mouse control to the paddle

Outgoing events:

"paddleUpdate", {
  match_id: string;
  pos: number, //x-value of player paddle
  playerside: string //"left" or "right"
}

"playerReady", {

}

Incoming Events (from server):

"gameStateUpdate" + match_id, {

}



*/
