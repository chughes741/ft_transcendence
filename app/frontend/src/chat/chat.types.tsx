export enum ChatMemberStatus {
  OK = "OK",
  MUTED = "MUTED",
  BANNED = "BANNED"
}
export enum ChatMemberRank {
  USER = "USER",
  ADMIN = "ADMIN",
  OWNER = "OWNER"
}

export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  AWAY = "AWAY"
}

export enum ChatRoomStatus {
  DIALOGUE = "Dialogue",
  PUBLIC = "Public",
  PRIVATE = "Private",
  PASSWORD = "Password"
}

export type RoomMemberEntity = {
  roomName: string;
  user: UserListItem;
};

export type MessagePayload = {
  username: string;
  roomName: string;
  content: string;
  timestamp: Date;
  avatar?: string;
};

export interface ChatRoomPayload {
  name: string;
  status: ChatRoomStatus;
  queryingUserRank: ChatMemberRank;
  latestMessage?: MessagePayload;
  lastActivity: Date;
  avatars?: string[];
}

export type RoomType = {
  name: string;
  status: ChatRoomStatus;
  rank: ChatMemberRank;
  messages: MessageType[];
  latestMessage?: MessageType;
  lastActivity: Date;
  hasUnreadMessages: boolean;
  avatars?: string[];
  users: { [key: string]: UserListItem };
};

export type DevError = {
  error: string;
};

export type CreateRoomRequest = {
  name: string;
  status: ChatRoomStatus;
  password: string;
  owner: string;
};

export class LeaveRoomRequest {
  roomName: string;
  username: string;
}

export interface UserListItem {
  username: string;
  roomName?: string;
  avatar: string;
  userStatus: UserStatus;
  chatMemberStatus?: ChatMemberStatus;
  rank?: ChatMemberRank;
  endOfBan?: Date;
  endOfMute?: Date;
}

export type MessageType = {
  username: string;
  roomId: string;
  content: string;
  timestamp_readable: string;
  timestamp: Date;
  isOwn: boolean;
  displayUser: boolean;
  displayTimestamp: boolean;
  displayDate: boolean;
  avatar?: string;
};
