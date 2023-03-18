/*******************/
/*     System      */
/*******************/
import React, { useState, useRef, useEffect } from "react";

/***************/
/*     CSS     */
/***************/
import "./styles/ChatPage.css";

interface CreateRoomModalProps {
  showModal: boolean;
  closeModal: () => void;
  onCreateRoom: (roomName: string, roomStatus: "public" | "private") => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  showModal,
  closeModal,
  onCreateRoom
}) => {
  const [roomName, setRoomName] = useState("");
  const [roomStatus, setRoomStatus] = useState<"public" | "private">("public");
  const roomNameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showModal && roomNameInput.current) {
      roomNameInput.current.focus();
    }
  }, [showModal]);

  const handleSubmit = () => {
    if (roomName.trim().length > 0) {
      onCreateRoom(roomName, roomStatus);
      setRoomName("");
      closeModal();
    } else {
      alert("Please enter a room name.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
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

          <label htmlFor="room-status">Room Status</label>
          <select
            id="room-status"
            value={roomStatus}
            onChange={(e) =>
              setRoomStatus(e.target.value as "public" | "private")
            }
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button
            className="submit-button"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
};
