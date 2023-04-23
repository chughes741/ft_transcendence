import { Module } from '@nestjs/common';
import TokenIsVerified from './tokenstorage/token-verify.service';
import { TokenStorageService } from './tokenstorage/token-storage.service';

@Module({

  providers: [TokenIsVerified, TokenStorageService],
  exports: [TokenIsVerified, TokenStorageService],
})
export class SharedModule {}