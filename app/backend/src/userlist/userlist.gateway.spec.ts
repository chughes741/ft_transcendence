import { Test, TestingModule } from '@nestjs/testing';
import { UserlistGateway } from './userlist.gateway';
import { PrismaModule } from "../prisma/prisma.module";
import { UserlistService } from './userlist.service';

describe('UserlistGateway', () => {
  let gateway: UserlistGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [UserlistGateway, UserlistService],
    }).compile();

    gateway = module.get<UserlistGateway>(UserlistGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
