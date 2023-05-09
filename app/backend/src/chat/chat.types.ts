import {
  ChatMemberRank,
  Message,
  ChatMember,
  ChatMemberStatus,
  ChatRoomStatus,
  UserStatus
} from "@prisma/client";
import { ChatMemberEntity } from "./entities/message.entity";

/******************************************************************************/
/***                          Generic Return Types                          ***/
/******************************************************************************/

export type DevError = {
  error: string;
};

export type DevSuccess = {
  success: string;
};

/******************************************************************************/
/***                                Requests                                ***/
/******************************************************************************/

export interface ListUsersRequest {
  chatRoomName: string;
}

export interface SendDirectMessageRequest {
  recipient: string;
  sender: string;
  senderRank: ChatMemberRank;
}

export interface CreateUserRequest {
  username: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface InviteUsersToRoomRequest {
  roomName: string;
  usernames: string[];
}

export class CreateChatRoomRequest {
  name: string;
  status: ChatRoomStatus;
  password: string;
  owner: string;
}

export class UpdateChatRoomRequest {
  username: string;
  roomName: string;
  status: ChatRoomStatus;
  oldPassword?: string;
  newPassword?: string;
}

export class SendMessageRequest {
  roomName: string;
  content: string;
  sender: string;
}

export class JoinRoomRequest {
  roomName: string;
  password: string;
  user: string;
}

export class LeaveRoomRequest {
  roomName: string;
  username: string;
}

export class BlockUserRequest {
  blocker: string;
  blockee: string;
}

/******************************************************************************/
/***                              Prisma Types                              ***/
/******************************************************************************/

export interface MessagePrismaType extends Message {
  sender: { username: string; avatar: string };
  room: { name: string };
}

export interface ChatMemberPrismaType extends ChatMember {
  member: {
    avatar: string;
    username: string;
    status: UserStatus;
  };
  room: { name: string };
}

/******************************************************************************/
/***                                Entities                                ***/
/******************************************************************************/

export interface IChatMemberEntity {
  username: string;
  roomName: string;
  avatar: string;
  chatMemberStatus: ChatMemberStatus;
  userStatus: UserStatus;
  rank: ChatMemberRank;
  endOfBan?: Date;
  endOfMute?: Date;
}

export interface IMessageEntity {
  username: string;
  roomName: string;
  content: string;
  avatar: string;
  timestamp: Date;
}

export type RoomMemberEntity = {
  roomName: string;
  user: ChatMemberEntity;
};

export interface ChatRoomEntity {
  name: string;
  queryingUserRank: ChatMemberRank /** @todo This should be embedded in the ChatMember type */;
  status: ChatRoomStatus;
  members: ChatMemberEntity[];
  latestMessage?: IMessageEntity;
  lastActivity: Date;
  avatars?: string[];
}

export interface UserEntity {
  username: string;
  avatar: string;
  status: UserStatus;
}

export interface AvailableRoomEntity {
  roomName: string;
  nbMembers: number;
  status: ChatRoomStatus;
  owner: UserEntity;
}
