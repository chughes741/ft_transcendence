import Game from "src/game/GameWindow";
import Box from "@mui/material/Box";
import GameActionBar from "./components/GameActionBar";

export default function GameWindow() {
  return (
    // Outer wrapper for component
    <Box
      sx={{
        backgroundColor: "green",
        mt: 5,
        ml: 5,
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
  playerSide: string //"left" or "right"
}

"playerReady", {

}

Incoming Events (from server):

"gameStateUpdate" + match_id, {

}



*/
