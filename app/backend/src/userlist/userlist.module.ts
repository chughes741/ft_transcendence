import { Module } from '@nestjs/common';
import { UserlistService } from './userlist.service';
import { UserlistGateway } from './userlist.gateway';
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from 'src/prisma/prisma.module';


@Module({
  imports : [PrismaModule],
  providers: [UserlistService, UserlistGateway],
  exports: [PrismaService]
})
export class UserlistModule {}
