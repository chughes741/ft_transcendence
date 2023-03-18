/*******************/
/*     System      */
/*******************/
import React, { useState, useRef, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Button from "../../components/Button";

/***************/
/*     CSS     */
/***************/
import "./styles/ChatPage.css";

interface CreateRoomModalProps {
  showModal: boolean;
  closeModal: () => void;
  onCreateRoom: (
    roomName: string,
    roomStatus: "public" | "private" | "password", // This is gonna need an enum :cry:
    password: string
  ) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  showModal,
  closeModal,
  onCreateRoom
}) => {
  const [roomName, setRoomName] = useState<string>("");
  const [roomStatus, setRoomStatus] = useState<
    "public" | "private" | "password"
  >("public"); // defaults to public
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const roomNameInput = useRef<HTMLInputElement>(null); // To focus on the input field

  useEffect(() => {
    if (showModal && roomNameInput.current) {
      roomNameInput.current.focus();
    }
  }, [showModal]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = () => {
    // Necessary check b/c we're not using a `form`, but a `button` w `onClick`
    if (roomStatus === "password" && !password) {
      alert("Please enter a room password.");
      return;
    }
    if (roomName.trim().length <= 0) {
      alert("Please enter a room name.");
      return;
    }
    console.log("Creating room modal: ", roomName, roomStatus, password);
    onCreateRoom(roomName, roomStatus, password);
    setRoomName("");
    setPassword("");
    closeModal();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
    if (e.key === "Escape") {
      closeModal();
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <>
      <div
        className="modal-overlay"
        onClick={closeModal}
      ></div>
      <div className="modal">
        <div className="modal-content">
          <h4>Create Room</h4>
          <label htmlFor="room-name">Room Name</label>
          <input
            type="text"
            id="room-name"
            ref={roomNameInput}
            value={roomName}
            maxLength={25}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={handleKeyPress}
            required
          />
          {roomStatus === "password" && (
            <label htmlFor="room-password">Password</label>
          )}
          {roomStatus === "password" && (
            <>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="room-password"
                  value={password}
                  maxLength={25}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  required
                />
                {showPassword ? (
                  <FiEye
                    onClick={togglePasswordVisibility}
                    style={{
                      cursor: "pointer",
                      color: "blue",
                      marginLeft: "10px"
                    }}
                  />
                ) : (
                  <FiEyeOff
                    onClick={togglePasswordVisibility}
                    style={{
                      cursor: "pointer",
                      color: "gray",
                      marginLeft: "10px"
                    }}
                  />
                )}
              </div>
            </>
          )}
          <label htmlFor="room-status">Room Status</label>
          <select
            id="room-status"
            value={roomStatus}
            onChange={(e) =>
              setRoomStatus(e.target.value as "public" | "private" | "password")
            }
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="password">Password Protected</option>
          </select>
          <Button
            content="Create"
            onClick={handleSubmit}
            width="100%"
          ></Button>
        </div>
      </div>
    </>
  );
};
