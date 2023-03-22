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

/***************/
/*     CSS     */
/***************/
import "./styles/ChatPage.css";
import ChatContext from "./components/ChatContext";
import RoomList from "./components/RoomList";

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

  const { currentRoomName, tempUsername, setTempUsername, joinRoom } =
    useContext(ChatContext);

  /**************/
  /*   Socket   */
  /**************/
  const socket = useContext(WebSocketContext);

  // FIXME: temporary addition for dev build to test user creation
  // TODO: remove this when user creation is implemented
  useEffect(() => {
    if (socket && !tempUsername) {
      let tempUser = "temp_user";
      let count = 0;
      // Try to create a temporary user
      const createTempUser = (username) => {
        socket.emit("createUser", username);
      };

      // Server acknowledges successful creation, returns username
      socket.on("userCreated", (username) => {
        setTempUsername(username);
        console.log(`Created user ${username} successfully!`);

        // FIXME: For testing purposes only
        // Join three separate rooms on connection
        joinRoom("PublicRoom", ""); // Public room
        joinRoom("PrivateRoom", ""); // Private room
        joinRoom("PasswordProtectedRoom", "secret"); // Password protected room with a placeholder password
      });

      // Name is taken, increment count and try again
      socket.on("userExists", () => {
        count += 1;
        tempUser = `temp_user${count}`;
        createTempUser(tempUser);
      });
      createTempUser(tempUser);
    }

    return () => {
      socket.off("userCreated");
      socket.off("userExists");
    };
  }, [socket, tempUsername, ""]);

  /**************************/
  /*   Returned fragment   */
  /*************************/
  return (
    <div className="chat-page">
      <SideBar />
      <RoomList />
      <div className="room-area">
        <ChatArea key={currentRoomName} />
      </div>
    </div>
  );
}
