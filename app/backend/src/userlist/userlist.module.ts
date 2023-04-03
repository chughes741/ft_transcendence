import { Module } from '@nestjs/common';
import { UserlistService } from './userlist.service';
import { UserlistGateway } from './userlist.gateway';
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from '@prisma/client';


@Module({
  imports : [PrismaService],
  providers: [UserlistService, UserlistGateway, PrismaService]
})
export class UserlistModule {}
