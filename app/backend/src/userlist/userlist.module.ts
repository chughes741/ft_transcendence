import { Module } from '@nestjs/common';
import { UserlistService } from './userlist.service';
import { UserlistGateway } from './userlist.gateway';
import { PrismaService } from 'src/prisma/prisma.service';


@Module({
  
  providers: [UserlistService, UserlistGateway, PrismaService]
})
export class UserlistModule {}
