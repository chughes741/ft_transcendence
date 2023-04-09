import { useContext, useState, useEffect } from "react";
import { WebSocketContext } from "src/contexts/WebSocketContext";
import ContextMenuUsers from "../ContextMenuUsers";
import { ChatMemberRank } from "../../pages/chat/ChatViewModel";
import { UserStatus } from "kingpong-lib";

export enum ChatMemberStatus {
  OK = "OK",
  BANNED = "BANNED",
  MUTED = "MUTED"
}

export interface myUsers {
  username: string;
  avatar: string;
  id: number;
  chatMemberstatus: ChatMemberStatus;
  userStatus: UserStatus;
  email: string;
  rank: ChatMemberRank;
  endOfBan: Date;
  endOfMute: Date;
}

interface UserListProps {
  chatRoomName: string;
}

export default function UserList({ chatRoomName }: UserListProps) {
  const handleSelectItem = (user: myUsers) => {
    console.log(user);
  };

  const socket = useContext(WebSocketContext);

  const [userList, setUserList] = useState<myUsers[]>([]);

  const kickUser = () => {
    socket.emit("kickMemberChat");
  };

  // Send "listUsers" event to server to get the user list
  useEffect(() => {
    socket.emit("listUsers", { chatRoomName });
  }, [socket]);

  // Listen for "userList" event from server and update the userList state
  useEffect(() => {
    socket.on("userList", (users: myUsers[]) => {
      console.log("New Use effect call to set UserList");
      setUserList(users);
    });
    return () => {
      socket.off("userList");
    };
  }, [socket]);

  return (
    <>
      <ContextMenuUsers />
    </>
  );
}
