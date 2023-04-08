import React, { useState, useEffect } from "react";
import { socket } from "../../../contexts/WebSocketContext";
import {useChatViewModelContext} from "../contexts/ChatViewModelContext";

export function getUserList() {
    const [users, setUsers] = useState<myUsers[]>([]);
    const {currentRoomName} = useChatViewModelContext();
    // Send "listUsers" event to server to get the user list
    useEffect(() => {
        socket.emit("listUsers", {currentRoomName});
        socket.on("userList", (users: myUsers[]) => {
            console.log("New Use effect call to set UserList");
            setUsers(users);
        });
        return () => {
            socket.off("userList");
        };
    }, [socket,users]);
}

export const handleSelectItem = (user: myUsers) => {
    console.log(user);
};


