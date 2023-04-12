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
  DIALOGUE = "DIALOGUE",
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  PASSWORD = "PASSWORD"
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

export interface ListUsersRequest {
  chatRoomName: string;
}

export interface LeaveRoomRequest {
  roomName: string;
  username: string;
}

export class UpdateChatRoomRequest {
  username: string;
  roomName: string;
  status: ChatRoomStatus;
  password?: string;
  oldPassword?: string;
}
