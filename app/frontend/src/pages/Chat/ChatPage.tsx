/*******************/
/*     System      */
/*******************/
import { useContext, useEffect } from "react";

/********************/
/*     Contexts     */
/********************/
import { WebSocketContext } from "../../contexts/WebSocketContext";

/***********************/
/*     Components      */
/***********************/
import SideBar from "../../components/SideBar";
import ChatArea from "./components/ChatArea";
import DevLoginBanner from "../../components/DevLoginBanner";

/***************/
/*     CSS     */
/***************/
import "./styles/ChatPage.css";
import ChatContext from "./components/ChatContext";
import RoomList from "./components/RoomList";
import { Box } from "@mui/system";

export type MessagePayload = {
  sender: string;
  roomName: string;
  content: string;
};

export type RoomType = {
  name: string;
};

export default function ChatPage() {
  /***********************/
  /*   State Variables   */
  /***********************/

  const { currentRoomName, tempUsername, setTempUsername, joinRoom, setRooms } =
    useContext(ChatContext);

  /**************/
  /*   Socket   */
  /**************/
  const socket = useContext(WebSocketContext);

  // FIXME: temporary addition for dev build to test user creation
  // TODO: remove this when user creation is implemented
  useEffect(() => {
    if (socket && !tempUsername) {
      setTempUsername("temp_user");
    }
  }, [socket, ""]);

  useEffect(() => {
    // Try to create a temporary user
    if (tempUsername) {
      const createTempUser = (username) => {
        socket.emit("userCreation", username);
      };

      // Server acknowledges successful creation, returns username
      socket.on("userCreated", (username) => {
        setTempUsername(username);
        setRooms(null);
        console.log(`Created user ${username} successfully!`);

        // FIXME: For testing purposes only
        // Join three separate rdooms on connection
        joinRoom("PublicRoom", "");
        joinRoom("PrivateRoom", "");
        joinRoom("PasswordProtectedRoom", "secret");
      });
      socket.on("userLoggedIn", (username) => {
        setTempUsername(username);
        setRooms(null);
        console.log(`${username} successfully logged in!`);

        // FIXME: For testing purposes only
        // Join three separate rooms on connection
        joinRoom("PublicRoom", "");
        joinRoom("PrivateRoom", "");
        joinRoom("PasswordProtectedRoom", "secret");
      });

      // Name is taken, login instead
      socket.on("userExists", () => {
        console.log(`User ${tempUsername} already exists!`);
        socket.emit("userLogin", tempUsername);
      });
      createTempUser(tempUsername);
    }

    return () => {
      socket.off("userCreated");
      socket.off("userExists");
    };
  }, [tempUsername, ""]);

  /**************************/
  /*   Returned fragment   */
  /*************************/
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
      }}
    >
      <Box position={"relative"}>
        <DevLoginBanner
          username={tempUsername}
          onLoginAsSomeoneElse={(username) => {
            setTempUsername(username);
            console.log(`Set temp ${username} successfully!`);
          }}
        />
      </Box>
      <Box
        className="chat-page"
        style={{
          display: "flex",
          flexDirection: "row",
          flexGrow: 1,
          paddingTop: "50px" //FIXME: This is a hack to make the chat page not overlap with the banner
        }}
      >
        <SideBar />
        <Box height={"100%"}>
          <RoomList />
        </Box>
        <Box className="room-area">
          <Box>
            <ChatArea key={currentRoomName} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
