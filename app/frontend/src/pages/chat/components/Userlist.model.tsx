export interface UserListItem {
    username: string;
    avatar: string;
    id: number;
    chatMemberstatus: any;
    userStatus: any;
    email: string;
    rank: any;
    endOfBan: any;
    endOfMute: any;
}

export interface UserListProps {
    userList : UserListItem[];
    handleClick : (UserListItem)=>void;
}