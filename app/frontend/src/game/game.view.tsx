import Game from "src/game/GameWindow";
import Box from "@mui/material/Box";
import GameActionBar from "./components/GameActionBar";
import { socket } from "src/contexts/WebSocket.context";
import * as GameTypes from "./game.types";
import { useGameContext } from "src/game/game.context";
import JoinGameQueue from "./components/game.joinGameQueue";

export default function GameWindow() {
  let lobby: GameTypes.LobbyCreatedDto = new GameTypes.LobbyCreatedDto("test");

  const { displayQueue } = useGameContext();

  socket.on("lobbyCreated", (payload: GameTypes.LobbyCreatedDto) => {
    console.log(payload.lobby_id);
    console.log("lobbyCreated event received");
    //Store lobby data

    lobby = payload;
    //Need to change views here
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
              <GameActionBar {...lobby} />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

// return (
//   // Outer wrapper for component
//   <Box
//     sx={{
//       backgroundColor: "green",
//       mt: 5,
//       ml: 5,
//       mr: 5,
//       display: "flex",
//       flexDirection: "column",
//       width: 800
//     }}
//   >
//     {/* Game canvas */}
//     <Box sx={{ width: 800, height: 400, backgroundColor: "red" }}>
//       <Game />
//     </Box>

//     {/*Secondary component wrapper for horizontal flex*/}
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "space-between"
//       }}
//     >
//       <Box sx={{ flexGrow: 1 }}>
//         <GameActionBar {...lobby} />
//       </Box>
//     </Box>

//     {displayQueue ? (
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "row",
//           alignItems: "space-between"
//         }}
//       >
//         <Button
//           onClick={() => {
//             console.log("joinGameQueue event emitted");
//             socket.emit("joinGameQueue", {
//               client_id: "",
//               join_time: Date.now()
//             });
//           }}
//           variant="outlined"
//         >
//           Join Queue
//         </Button>
//       </Box>
//     ) : <Box />}
//   </Box>
// );