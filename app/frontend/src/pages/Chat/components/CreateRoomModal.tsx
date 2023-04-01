/*******************/
/*     System      */
/*******************/
import React, { useState, useCallback } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Button from "../../../components/Button";

/***************/
/*     CSS     */
/***************/
import "../styles/ChatPage.css";
import { useRoomModal } from "./useRoomModal";

interface CreateRoomModalProps {
  showModal: boolean;
  closeModal: () => void;
  onCreateRoom: (
    roomName: string,
    roomStatus: "PUBLIC" | "PRIVATE" | "PASSWORD", // This is gonna need an enum :cry:
    password: string
  ) => Promise<boolean>;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  showModal,
  closeModal,
  onCreateRoom
}) => {
  const [roomStatus, setRoomStatus] = useState<
    "PUBLIC" | "PRIVATE" | "PASSWORD"
  >("PUBLIC"); // defaults to public

  // Improves code reusability btw Create and Join RoomModals
  const {
    roomName,
    setRoomName,
    password,
    setPassword,
    showPassword,
    roomNameInput,
    togglePasswordVisibility
  } = useRoomModal(showModal, closeModal);

  const handleSubmit = useCallback(async () => {
    // Necessary check b/c we're not using a `form`, but a `button` w `onClick`
    if (roomStatus === "PASSWORD" && !password) {
      alert("Please enter a room password.");
      return;
    }
    if (roomName.trim().length <= 0) {
      alert("Please enter a room name.");
      return;
    }
    console.log("Creating room modal: ", roomName, roomStatus, password);
    const roomCreated = await onCreateRoom(roomName, roomStatus, password);
    if (roomCreated) {
      setRoomName("");
      setPassword("");
      closeModal();
    } else {
      alert(`Room creation failed on ${roomName}. Please try again.`);
    }
  }, [roomName, password, closeModal, onCreateRoom]);

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
          <h3>Create Room</h3>
          <label htmlFor="room-name">Room Name</label>
          <div className="input-container-modal">
            <input
              type="text"
              id="room-name"
              ref={roomNameInput}
              value={roomName}
              maxLength={25}
              onChange={(e) => {
                console.log("e.target.value: ", e.target.value);
                setRoomName(e.target.value);
              }}
              onKeyDown={handleKeyPress}
              required
            />
          </div>
          {roomStatus === "PASSWORD" && (
            <label htmlFor="room-password">Password</label>
          )}
          {roomStatus === "PASSWORD" && (
            <>
              <div className="input-container-modal">
                <input
                  type={showPassword ? "text" : "PASSWORD"}
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
                    size={24}
                    style={{
                      cursor: "pointer",
                      color: "blue",
                      marginLeft: "10px"
                    }}
                  />
                ) : (
                  <FiEyeOff
                    onClick={togglePasswordVisibility}
                    size={24}
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
          <div className="input-container-modal">
            <select
              id="room-status"
              value={roomStatus}
              onChange={(e) =>
                setRoomStatus(
                  e.target.value as "PUBLIC" | "PRIVATE" | "PASSWORD"
                )
              }
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="PASSWORD">Password Protected</option>
            </select>
          </div>
          <Button
            content="Create Room"
            onClick={handleSubmit}
            width="100%"
          ></Button>
        </div>
      </div>
    </>
  );
};
