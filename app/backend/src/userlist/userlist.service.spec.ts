import { Test, TestingModule } from '@nestjs/testing';
import { UserlistService } from './userlist.service';
import { PrismaModule } from "../prisma/prisma.module";
import { UserlistGateway } from './userlist.gateway';

describe('UserlistService', () => {
  let service: UserlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [UserlistService, UserlistGateway],
    }).compile();

    service = module.get<UserlistService>(UserlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
