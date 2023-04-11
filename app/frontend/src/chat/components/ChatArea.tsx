/***************/
/*     CSS     */
/***************/
import "src/styles/chat/ChatArea.css";
import ChatMessagesContainerView from "./ChatMessagesContainer";

import "src/styles/chat/ChatArea.css";
import ChatInputContainerView from "./ChatInputContainer";
import { Grid } from "@mui/material";
import { useChatContext } from "src/chat/chat.context";

const ChatAreaView = () => {
  const { currentRoomName } = useChatContext();

  const GridStyle = {
    height: "100%",
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden"
  };

  return (
    <>
      <Grid
        container
        direction="column"
        wrap="nowrap"
        sx={GridStyle}
      >
        <Grid
          item
          sx={{
            textAlign: "center",
            backgroundColor: "#1f1f1f",
            padding: "6px",
            height: "auto",
            minHeight: "5vh",
            fontSize: "1.3rem"
          }}
        >
          {currentRoomName}
        </Grid>
        <Grid
          item
          sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}
        >
          <ChatMessagesContainerView />
        </Grid>
        <Grid
          item
          sx={{ flexGrow: 0, flexShrink: 0 }}
        >
          <ChatInputContainerView />
        </Grid>
      </Grid>
    </>
  );
};

export default ChatAreaView;
