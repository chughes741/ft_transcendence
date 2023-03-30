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
import SideBar from "../../components/SideBar/SideBar";
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

export type DevError = {
  error: string;
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

  const userLogin = async (username: string): Promise<boolean> => {
    let success = false;
    socket.emit("userLogin", username, (response: DevError | string) => {
      if (typeof response === "object") {
        console.log("Error response from user login: ", response.error);
      } else {
        console.log(`Logged in user ${username} successfully!`);
        console.log("Success response from user login: ");
        console.log(response);
        setTempUsername(username);
        success = true;
      }
    });
    return success;
  };

  const createUser = async (username: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      socket.emit("userCreation", username, (response: DevError | string) => {
        if (typeof response === "object") {
          console.log("Error response from user creation: ", response.error);
          resolve(false);
          // Try to log in instead
        } else {
          setTempUsername(username);
          setRooms(null);
          console.log(`Created user ${username} successfully!`);

          // FIXME: For testing purposes only
          // Join three separate rooms on connection
          joinRoom("PublicRoom", "");
          joinRoom("PrivateRoom", "");
          joinRoom("PasswordProtectedRoom", "secret");
          joinRoom("PasswordProtectedRoomFromCreateUser", "secret");
          resolve(true);
        }
      });
    });
  };

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
      const createTempUser = async (username: string) => {
        const userCreated = await createUser(username);
        if (!userCreated) {
          // Try to login instead
          const userLogged = await userLogin(username);
          if (!userLogged) {
            console.log("Failed to create or login to user", username);
            // Try to create a new user with a different name
            // const newUsername = username + "_1";
            // setTempUsername(newUsername);
            // createTempUser(newUsername);
          }
        }
      };

      createTempUser(tempUsername);
    }
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
          }}
        />
      </Box>
      <Box
        className="chat-page"
        style={{
          display: "flex",
          flexDirection: "row",
          flexGrow: 1,
          paddingTop: "55px" //FIXME: This is a hack to make the chat page not overlap with the banner
        }}
      >
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
