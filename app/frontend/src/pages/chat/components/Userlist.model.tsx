import { UserStatus } from "kingpong-lib";
import { ChatMemberRank } from "../ChatViewModel";

export enum ChatMemberStatus {
  OK = "OK",
  BANNED = "BANNED",
  MUTED = "MUTED"
}

export interface UserListItem {
  username: string;
  avatar: string;
  chatMemberstatus: ChatMemberStatus;
  userStatus: UserStatus;
  rank: ChatMemberRank;
  endOfBan: Date;
  endOfMute: Date;
}

export interface UserListProps {
  userList: UserListItem[];
  handleClick: (e: React.MouseEvent, userData: UserListItem) => void;
}
