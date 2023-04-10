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
  const { currentRoomName } = useChatViewModelContext();

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
