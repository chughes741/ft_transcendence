import { UserType } from "src/components/User";
import ListTabulation from "src/components/chat/ListTab";
import React, { useContext, useState, useEffect } from "react";
import { WebSocketContext } from "src/contexts/WebSocketContext";
import { SocketAddress } from "net";
import {useChatViewModelContext} from "../../pages/chat/contexts/ChatViewModelContext";
import ContextMenu from "../ContextMenu";

export interface myUsers {
    username: string;
    avatar: string;
    id : number;
    chatMemberstatus : any;
    userStatus : any;
    email : string,
    rank : any;
    endOfBan : any;
    endOfMute : any;
}

interface UserListProsp{
    chatRoomName :string;
}

function UserList( { chatRoomName } : UserListProsp) {

    const {contextMenuPosition, handleContextMenu} = useChatViewModelContext();

    const handleSelectItem = (user: myUsers) => {
        console.log(user);
    }

    const socket = useContext(WebSocketContext);
    

    const [userList, setUserList] = useState<myUsers[]>([]);




    // Send "listUsers" event to server to get the user list
    useEffect(() => {
        socket.emit('listUsers', { chatRoomName });
    }, [socket]);

    // Listen for "userList" event from server and update the userList state
    useEffect(() => {
        socket.on('userList', (users: myUsers[]) => {
            console.log("New Use effect call to set UserList")
            setUserList(users);
        
        });
        return () => {
            socket.off('userList');
        };
    }, [socket]);
    return (
        <>
            <ListTabulation users={userList} heading={chatRoomName} onSelectItem={handleSelectItem}
            />
            <ContextMenu
                position={contextMenuPosition}
                options={[
                {
                    label:"view Profile",
                    onClick: ()=> {console.log('ogog')}
                }
                ]}

            />
        </>
    )
}

export default UserList;