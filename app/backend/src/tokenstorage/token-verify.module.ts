import { Module, Global } from '@nestjs/common';
import { TokenStorageService } from './token-storage.service';
import TokenIsVerified from './token-verify.service';
import { TokenStorageModule } from './token-storage.module';

@Global()
@Module({
    imports: [TokenStorageModule],
    providers: [TokenIsVerified, TokenStorageService],
    exports: [TokenIsVerified, TokenStorageModule, TokenStorageService],
})
export class TokenModule {}