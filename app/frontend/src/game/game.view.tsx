import Game from "src/game/GameWindow";
import Box from "@mui/material/Box";
import GameActionBar from "./components/GameActionBar";
import { socket } from "src/contexts/WebSocket.context";
import JoinGameQueue from "./components/game.joinGameQueue";
import { LobbyCreatedEvent } from "kingpong-lib";
import { useGameViewModelContext } from "./game.viewModel";
import { useRootViewModelContext } from "src/root.context";

export default function GameWindow() {
  const { displayQueue, lobby } = useGameViewModelContext();
  const { self } = useRootViewModelContext();
    
  socket.on("lobbyCreated", (payload: LobbyCreatedEvent) => {
    console.log(payload.lobby_id);
    console.log("lobbyCreated event received");

    lobby.lobby_id = payload.lobby_id;
    lobby.player_username = self.username;
    lobby.player_avatar = self.avatar;
    lobby.player_side = payload.player_side;
    lobby.opponent_username = payload.opponent_username;
  });

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
