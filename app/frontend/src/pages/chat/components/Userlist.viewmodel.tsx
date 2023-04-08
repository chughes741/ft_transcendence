import React, { useState, useEffect } from "react";
import { socket } from "../../../contexts/WebSocketContext";
import {useChatViewModelContext} from "../contexts/ChatViewModelContext";
import {UserListItem} from "./Userlist.model";

export function getUserList() {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const {currentRoomName} = useChatViewModelContext();
    // Send "listUsers" event to server to get the user list
    useEffect(() => {
        socket.emit("listUsers", {currentRoomName});
        socket.on("userList", (users: UserListItem[]) => {
            console.log("New Use effect call to set UserList");
            setUsers(users);
        });
        return () => {
            socket.off("userList");
        };
    }, [socket,users]);
}

export const handleSelectItem = (user:UserListItem) => {
    console.log(user);
};


