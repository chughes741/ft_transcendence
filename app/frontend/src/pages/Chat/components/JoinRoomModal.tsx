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
  onCreateRoom: (roomName: string, password: string) => void;
}

export const JoinRoomModal: React.FC<CreateRoomModalProps> = ({
  showModal,
  closeModal,
  onCreateRoom
}) => {
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
      if (roomName.trim().length <= 0) {
        alert("Please enter a room name.");
        return;
      }
      console.log("Creating room modal: ", roomName, password);
      onCreateRoom(roomName, password);
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
          <h3>Join Room</h3>
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
          <label htmlFor="room-password">Password</label>
          <div className="input-container-modal">
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
          <Button
            content="Join Room"
            onClick={handleSubmitRef.current}
            width="100%"
          ></Button>
        </div>
      </div>
    </>
  );
};
