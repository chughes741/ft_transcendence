import Input from "../components/Input";
import PopUp from "../popups/PopUpMenu";
import { useState } from "react";

export default function ChatTest() {
  const [message, setMessage] = useState("");

  const handleMessageInput = (event) => {
    setMessage(event.target.value);
  };

  return (
    <>
      <PopUp />
      <div className="chat-container">
        <div className="message-window">
          <p>
            {message}
            <br />
          </p>
        </div>
        <div className="input-container">
          <input
            value={message}
            type="text"
            placeholder="Write right here"
            onChange={handleMessageInput}
          />
        </div>
      </div>
    </>
  );
}
