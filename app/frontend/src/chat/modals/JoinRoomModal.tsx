import { AvatarGroup, Box, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  IconButton,
  DialogActions,
  /* Rooms dropdown */
  Autocomplete,
  MenuItem,
  Avatar
} from "@mui/material";
import { useRoomModal } from "./useRoomModal";
import ButtonFunky from "../../components/ButtonFunky";
import { UserStatus } from "kingpong-lib";
import { socket } from "../../contexts/WebSocket.context";
import { useChatContext } from "../chat.context";
import { Public, VpnKey } from "@mui/icons-material";
import UserStatusBadge from "../../components/UserStatusBadge";
import { ChatRoomStatus } from "../chat.types";

interface JoinRoomModalProps {
  showModal: boolean;
  closeModal: () => void;
  onJoinRoom: (roomName: string, password: string) => void;
}

export interface UserEntity {
  username: string;
  avatar: string;
  status: UserStatus;
}

export interface AvailableRoomEntity {
  roomName: string;
  nbMembers: number;
  status: ChatRoomStatus.PASSWORD | ChatRoomStatus.PUBLIC;
  owner: UserEntity;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  showModal,
  closeModal,
  onJoinRoom
}) => {
  if (!showModal) {
    return null;
  }
  const { tempUsername } = useChatContext();

  const { password, setPassword, showPassword, togglePasswordVisibility } =
    useRoomModal(showModal);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoomEntity[]>(
    []
  );
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoomEntity | null>(
    null
  );

  const handleSubmit = useCallback(() => {
    if (!selectedRoom) {
      alert("Please select a room.");
      return;
    }
    console.log("Joining room modal: ", selectedRoom.roomName, password);
    onJoinRoom(selectedRoom.roomName, password);
    setSelectedRoom(null);
    setPassword("");
    closeModal();
  }, [selectedRoom, password, closeModal, onJoinRoom]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
    if (e.key === "Escape") {
      closeModal();
    }
  };

  useEffect(() => {
    // Send a socket event to get the list of available rooms
    socket.emit(
      "listAvailableChatRooms",
      tempUsername,
      (rooms: AvailableRoomEntity[]) => {
        console.log("Received available rooms: ", rooms);
        setAvailableRooms(rooms);
      }
    );
  }, [tempUsername, showModal]);

  return (
    <Dialog
      open={showModal}
      onClose={closeModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: "35%",
          overflowX: "hidden"
        }
      }}
    >
      <DialogTitle alignContent={"center"}>Join Room</DialogTitle>
      <DialogContent
        sx={{
          "& > *:not(:last-child)": {
            marginBottom: 2
          }
        }}
      >
        <DialogContentText>Enter room details:</DialogContentText>
        <Autocomplete
          id="room-autocomplete"
          options={availableRooms}
          getOptionLabel={(option) => option.roomName}
          value={selectedRoom}
          renderOption={(props, option) => (
            <MenuItem
              {...props}
              sx={{ paddingTop: "16px" }}
            >
              <AvatarGroup total={option.nbMembers + 1}>
                <UserStatusBadge
                  status={option.owner.status}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "left"
                  }}
                >
                  <Avatar
                    src={option.owner.avatar}
                    alt={option.owner.username}
                  />
                </UserStatusBadge>
              </AvatarGroup>
              <Box
                justifyContent="center"
                display="flex"
                flexGrow={1}
              >
                <Typography
                  sx={{
                    fontWeight: "bold", // Increase font weight
                    fontSize: "1.1rem" // Increase font size
                  }}
                >
                  {option.roomName}
                </Typography>
              </Box>
              <span style={{ marginLeft: "auto", marginRight: "16px" }}>
                {option.status === ChatRoomStatus.PASSWORD ? (
                  <VpnKey />
                ) : (
                  <Public />
                )}
              </span>
            </MenuItem>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Room"
              variant="outlined"
              margin="normal"
              fullWidth
            />
          )}
          onChange={(event, value) => setSelectedRoom(value)}
        />
        {selectedRoom && selectedRoom.status === ChatRoomStatus.PASSWORD && (
          <TextField
            margin="dense"
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            InputProps={{
              endAdornment: (
                <IconButton
                  edge="end"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </IconButton>
              )
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={closeModal}
          color="primary"
        >
          Cancel
        </Button>
        <ButtonFunky
          onClick={handleSubmit}
          content="Join Room"
          width="50%"
        />
      </DialogActions>
    </Dialog>
  );
};
