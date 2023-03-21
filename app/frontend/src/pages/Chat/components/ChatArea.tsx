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

const ChatArea = () => {
  const { currentRoomName, currentRoomMessages } = useContext(ChatContext);

  return (
    <div className="chat-area">
      <div className="room-title">
        <h2>{currentRoomName}</h2>
      </div>
      <ChatMessagesContainer messages={currentRoomMessages} />
      <ChatInputContainer />
    </div>
  );
};

export default ChatArea;

// type ChatAreaProps = {
//   roomName: string;
//   messages: Array<MessageType>;
//   onSendMessage: (roomName: string, message: string) => void;
// };

// const groupMessages = (messages: Array<MessageType>): Array<MessageType> => {
//   const groupedMessages: Array<MessageType> = [];

//   messages.forEach((msg, index) => {
//     const prevMessage = messages[index - 1];
//     const nextMessage = messages[index + 1];

//     const displayTimestamp =
//       !nextMessage || nextMessage.timestamp !== msg.timestamp;
//     const displayUser = !prevMessage || prevMessage.user !== msg.user;

//     groupedMessages.push({
//       ...msg,
//       displayUser,
//       displayTimestamp
//     });
//   });

//   return groupedMessages;
// };

// const ChatArea = (room: ChatAreaProps) => {
//   const [textValue, setTextValue] = React.useState("");
//   const socket = useContext(WebSocketContext);
//   const messageInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (messageInputRef.current) {
//       messageInputRef.current.focus();
//     }
//   }, [room.roomName]);

//   const sendMessage = (event) => {
//     event.preventDefault();
//     room.onSendMessage(room.roomName, textValue);
//     setTextValue("");
//   };
//   const currentUser = socket.id;
//   const groupedMessages = groupMessages(room.messages);

//   const lastMessageRef = useRef<HTMLDivElement>(null);

//   // When new messages are received, scroll to it
//   useEffect(() => {
//     if (lastMessageRef.current) {
//       lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [groupedMessages]);

//   return (
//     <div className="room">
//       <div className="chat-area">
//         <div className="room-title">
//           <h2>{room.roomName}</h2>
//         </div>
//         <div className="message-container">
//           <div className="messages">
//             {groupedMessages.map((message, index) => (
//               <Message
//                 ref={
//                   index === groupedMessages.length - 1 ? lastMessageRef : null
//                 }
//                 key={index}
//                 message={message}
//                 currentUser={currentUser}
//               />
//             ))}
//           </div>
//         </div>
//         <div className="input-chat-container">
//           <form
//             className="form"
//             onSubmit={sendMessage}
//           >
//             <ResizableTextArea
//               ref={messageInputRef}
//               value={textValue}
//               placeholder="You take the text, and you put it in the box."
//               onChange={(event) => setTextValue(event.target.value)}
//               onEnterPress={sendMessage}
//             />
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatArea;
