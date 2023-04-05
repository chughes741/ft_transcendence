import { IMessageEntity, MessagePrismaType } from "../chat.gateway";

export class MessageEntity implements IMessageEntity {
  username: string;
  roomName: string;
  content: string;
  timestamp: Date;

  constructor(prismaMessage: MessagePrismaType) {
    this.username = prismaMessage.sender.username;
    this.roomName = prismaMessage.room.name;
    this.content = prismaMessage.content;
    this.timestamp = prismaMessage.createdAt;
  }
}
