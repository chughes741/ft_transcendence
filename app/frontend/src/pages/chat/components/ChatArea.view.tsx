/***************/
/*     CSS     */
/***************/
import "../styles/ChatArea.css";
import ChatMessagesContainerView from "./ChatMessagesContainer.view";

import "../styles/ChatArea.css";
import ChatInputContainerView from "./ChatInputContainer.view";
import { Grid } from "@mui/material";
import { useChatViewModelContext } from "../contexts/ChatViewModelContext";

const ChatAreaView = () => {
  const { currentRoomName, currentRoomMessages } = useChatViewModelContext();

  const GridStyle = {
      height: "100%",
      width: "100%",
      maxWidth: "100%",
      overflow: "hidden"
  }

  return (
    <>
      <Grid
        container
        direction="column"
        wrap="nowrap"
        style={GridStyle}
      >
        <Grid
          item
          style={{ alignItems: "center", padding: 0 }}
        >
          <h2>{currentRoomName}</h2>
        </Grid>
        <Grid
          item
          style={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}
        >
          <ChatMessagesContainerView messages={currentRoomMessages} />
        </Grid>
        <Grid
          item
          style={{ flexGrow: 0, flexShrink: 0, maxHeight: "30%" }}
        >
          <ChatInputContainerView />
        </Grid>
      </Grid>
    </>
  );
};

export default ChatAreaView;
