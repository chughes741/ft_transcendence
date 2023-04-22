import { Module } from '@nestjs/common';
import { TokenStorageService } from './token-storage.service';

@Module({
  providers: [TokenStorageService],
  exports: [TokenStorageService],
})
export class TokenStorageModule {}