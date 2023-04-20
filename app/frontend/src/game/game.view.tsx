import Box from "@mui/material/Box";

import Game from "src/game/GameWindow";
import GameActionBar from "./components/GameActionBar";
import JoinGameQueue from "./components/game.joinGameQueue";
import { useGameViewModelContext } from "./game.viewModel";

export default function GameWindow() {
  const { displayQueue } = useGameViewModelContext();

  return (
    <>
      {displayQueue === true ? (
        <JoinGameQueue />
      ) : (
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
      )}
    </>
  );
}
