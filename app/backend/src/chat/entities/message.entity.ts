import { ChatMemberRank, ChatMemberStatus, UserStatus } from "@prisma/client";
import {
  IMessageEntity,
  MessagePrismaType,
  IChatMemberEntity,
  ChatMemberPrismaType
} from "../chat.types";

export class MessageEntity implements IMessageEntity {
  username: string;
  roomName: string;
  content: string;
  avatar: string;
  timestamp: Date;

  constructor(prismaMessage: MessagePrismaType) {
    this.username = prismaMessage.sender.username;
    this.roomName = prismaMessage.room.name;
    this.content = prismaMessage.content;
    this.timestamp = prismaMessage.createdAt;
    this.avatar = prismaMessage.sender.avatar;
  }
}

export class ChatMemberEntity implements IChatMemberEntity {
  username: string;
  roomName: string;
  avatar: string;
  chatMemberStatus: ChatMemberStatus;
  userStatus: UserStatus;
  rank: ChatMemberRank;
  endOfBan?: Date;
  endOfMute?: Date;

  constructor(prismaMessage: ChatMemberPrismaType) {
    this.username = prismaMessage.member.username;
    this.roomName = prismaMessage.room.name;
    this.avatar = prismaMessage.member.avatar;
    this.chatMemberStatus = prismaMessage.status;
    this.userStatus = prismaMessage.member.status;
    this.rank = prismaMessage.rank;
    this.endOfBan = prismaMessage.endOfBan;
    this.endOfMute = prismaMessage.endOfMute;
  }
}
