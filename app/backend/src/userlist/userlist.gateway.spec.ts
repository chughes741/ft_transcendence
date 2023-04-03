import { Test, TestingModule } from '@nestjs/testing';
import { UserlistGateway } from './userlist.gateway';

describe('UserlistGateway', () => {
  let gateway: UserlistGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserlistGateway],
    }).compile();

    gateway = module.get<UserlistGateway>(UserlistGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
