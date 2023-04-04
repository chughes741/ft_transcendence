import { UserType } from "src/components/User";
import ListTabulation from "src/components/chat/ListTab";
import { useContext, useState, useEffect } from "react";
import { WebSocketContext } from "src/contexts/WebSocketContext";
import { SocketAddress } from "net";

export interface myUsers {
    username : string;
}

interface UserListProsp{
    chatRoomName :string;
}

function UserList( { chatRoomName } : UserListProsp) {
    
/*
    const myusers: myUsers[] = [
        { uuid: '000', nick: 'Gwineth', email: 'bitchplease@666.com', avatar: 'goo.fuckyou', },
        { uuid: '007', nick: 'James', email: 'discreet101@double.com', avatar: 'savethe.queen.org' },
        { uuid: '666', nick: 'satan', email: 'gotohell@inferno.inc', avatar: 'PureEvil.disney+' },
        { uuid: '777', nick: 'BobÉpine', email: 'supaman@burine.org', avatar: 'Poule' }
    ]*/

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
            <ListTabulation users={userList} heading={chatRoomName} onSelectItem={handleSelectItem} />
        </>
    )
}

export default UserList;