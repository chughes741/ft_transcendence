import { Injectable, Logger } from "@nestjs/common";
import { ChatRoomStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { JoinRoomDto, Message } from "./chat.gateway";
import { CreateChatDto } from "./dto/create-chat.dto";
import { UpdateChatDto } from "./dto/update-chat.dto";

const logger = new Logger("ChatService");

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createChatDto: CreateChatDto) {
    logger.log("Created a new chat");
    return "This action adds a new chat";
  }

  async joinRoom(joinDto: JoinRoomDto): Promise<Message[] | Error> {
    const { roomName, password, user } = joinDto;
    const room = await this.prismaService.chatRoom.findUnique({
      where: { name: roomName }
    });

    if (!room) {
      // Room doesn't exist, create it as a public room
      await this.prismaService.createChatRoom({
        name: roomName,
        status: ChatRoomStatus.PUBLIC,
        owner: user
      });
      return [];
    } else if (
      room.status === ChatRoomStatus.PASSWORD &&
      room.password !== password
    ) {
      return { name: "IncorrectPasswordError", message: "Incorrect password" };
    }

    // Fetch last 50 messages and send them to the user
    const messagesPage = await this.prismaService.message.findMany({
      where: { roomId: room.id },
      take: 50,
      include: {
        sender: {
          select: { username: true }
        },
        room: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Order the messages from oldest to newest and send them to the user
    return messagesPage.reverse();
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
