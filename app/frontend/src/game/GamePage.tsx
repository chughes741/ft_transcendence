import { Box } from "@mui/material";
import Game from "./GameWindow";
import { useRootViewModelContext } from "../root.context";
import GameActionBar from "./components/GameActionBar";
import ChatAreaView from "../chat/components/ChatArea";
import { useGameViewModelContext } from "./game.viewModel";
import { useChatContext } from "../chat/chat.context";
import { useState } from "react";

export default function GamePage() {
  const { setFullscreen } = useRootViewModelContext();
  const { setCurrentRoomName, sendDirectMessage } = useChatContext();
  // set a roomName state variable
  const [roomName, setRoomName] = useState("");

  const gameData = useGameViewModelContext();
  setFullscreen(true);

  const setGameChatRoom = async () => {
    if (roomName !== "") {
      return;
    }
    const ret = await sendDirectMessage(gameData.opponentUsername);
    if (typeof ret === "boolean") {
      console.log("Error creating chat room");
      return;
    } else {
      setRoomName(ret);
      setCurrentRoomName(ret);
    }
  };
  setGameChatRoom();

  return (
    <Box
      sx={{
        mt: 5,
        ml: 5,
        mr: 5,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Flex box to hold the game and the chat */}
      <Box
        id="game-page-wrapper"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "space-between",
          width: 800
        }}
      >
        {/* Box to hold canvas and game-bar */}
        <Box
          id="game-wrapper"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "space-between"
          }}
        >
          {/* Game canvas */}
          <Box
            id="game-canvas"
            sx={{ width: 800, height: 400, backgroundColor: "red" }}
          >
            <Game />
          </Box>

          {/*Secondary component wrapper for horizontal flex*/}
          <Box
            id="game-bar-wrapper"
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
      </Box>
      {/* Wrapper for the chat component */}
      <Box
        id="chat-wrapper"
        sx={{
          display: "flex",
          alignItems: "space-between"
        }}
      >
        {/* Chat component */}
        <Box id="chat">
          <ChatAreaView />
        </Box>
      </Box>
    </Box>
  );
}
