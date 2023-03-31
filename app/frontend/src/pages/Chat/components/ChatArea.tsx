/*******************/
/*     System      */
/*******************/
import { useContext } from "react";

/***************/
/*     CSS     */
/***************/
import "../styles/ChatArea.css";
import { ChatContext } from "./ChatContext";
import ChatMessagesContainer from "./ChatMessagesContainer";

import "../styles/ChatArea.css";
import ChatInputContainer from "./ChatInputContainer";
import { Grid } from "@mui/material";

const ChatArea = () => {
  const { currentRoomName, currentRoomMessages } = useContext(ChatContext);

  return (
    <>
      <Grid
        container
        direction="column"
        wrap="nowrap"
        style={{
          height: "100%",
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden"
        }}
      >
        <Grid
          item
          style={{ alignItems: "center", padding: 0 }}
        >
          <h2>{currentRoomName}</h2>
        </Grid>
        <Grid
          item
          style={{ flexGrow: 1 }}
        >
          <ChatMessagesContainer messages={currentRoomMessages} />
        </Grid>
        <Grid
          item
          style={{
            flexGrow: 0,
            flexShrink: 0,
            maxHeight: "30%"
          }}
        >
          <ChatInputContainer />
        </Grid>
      </Grid>
    </>
  );
};

export default ChatArea;
