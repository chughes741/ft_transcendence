import { Test, TestingModule } from '@nestjs/testing';
import { UserlistService } from './userlist.service';

describe('UserlistService', () => {
  let service: UserlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserlistService],
    }).compile();

    service = module.get<UserlistService>(UserlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
