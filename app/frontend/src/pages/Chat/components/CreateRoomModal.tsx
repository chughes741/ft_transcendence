/*******************/
/*     System      */
/*******************/
import React, { useState, useRef, useEffect } from "react";
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
  ) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  showModal,
  closeModal,
  onCreateRoom
}) => {
  const [roomStatus, setRoomStatus] = useState<
    "PUBLIC" | "PRIVATE" | "PASSWORD"
  >("PUBLIC"); // defaults to public
  // Creates a bogus ref to be used in the `useEffect` below.
  const handleSubmitRef = useRef<() => void>(() => {
    return; // To prevent linter errors
  });

  // Improves code reusability btw Create and Join RoomModals
  const {
    roomName,
    setRoomName,
    password,
    setPassword,
    showPassword,
    roomNameInput,
    togglePasswordVisibility,
    handleKeyPress
  } = useRoomModal(showModal, closeModal, handleSubmitRef.current);

  // Update handleSubmit ref with the actual implementation
  useEffect(() => {
    handleSubmitRef.current = () => {
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
      onCreateRoom(roomName, roomStatus, password);
      setRoomName("");
      setPassword("");
      closeModal();
    };
  }, [roomName, password, closeModal, onCreateRoom]);

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
              onChange={(e) => setRoomName(e.target.value)}
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
            onClick={handleSubmitRef.current}
            width="100%"
          ></Button>
        </div>
      </div>
    </>
  );
};
