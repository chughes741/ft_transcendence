import { Module, Global } from '@nestjs/common';
import { TokenStorageService } from './token-storage.service';
import TokenIsVerified from './token-verify.service';

@Global()
@Module({
  providers: [TokenStorageService, TokenIsVerified],
  exports: [TokenStorageService, TokenIsVerified],
})
export class SharedModule {}