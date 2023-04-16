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

/******************************************************************************/
/***                           Chat Context Types                           ***/
/******************************************************************************/

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

/******************************************************************************/
/***                            Returned Entities                           ***/
/******************************************************************************/

export type DevError = {
  error: string;
};

export interface ChatMemberEntity {
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
  user: ChatMemberEntity;
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
  unreadMessagesCount: number;
  avatars?: string[];
  users: { [key: string]: ChatMemberEntity };
};

/******************************************************************************/
/***                              Request Types                             ***/
/******************************************************************************/

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

export interface SendDirectMessageRequest {
  username: string;
  sender: string;
}

export interface UpdateChatRoomRequest {
  username: string;
  roomName: string;
  status: ChatRoomStatus;
  oldPassword?: string;
  newPassword?: string;
}

export interface AuthRequest {
  username: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateChatMemberRequest {
  queryingUser: string;
  usernameToUpdate: string;
  roomName: string;
  status: ChatMemberStatus;
  queryingMemberRank: ChatMemberRank;
  memberToUpdateRank: ChatMemberRank;
  duration?: number;
}

export interface KickMemberRequest {
  memberToKickUUID?: number;
  memberToKickUsername: string;
  memberToKickRank: ChatMemberRank;
  roomName: string;
  queryingMemberRank: ChatMemberRank;
}
