import { Module } from '@nestjs/common';
import { UserlistService } from './userlist.service';
import { UserlistGateway } from './userlist.gateway';
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatModule } from 'src/chat/chat.module';
import { ChatGateway } from 'src/chat/chat.gateway';
import { UserConnectionsService } from 'src/user-connections.service';
import { ChatService } from 'src/chat/chat.service';


@Module({
  imports : [PrismaModule, ChatModule],
  providers: [UserlistService, UserlistGateway, ChatGateway, PrismaService, UserConnectionsService, ChatService],
})
export class UserlistModule {}
