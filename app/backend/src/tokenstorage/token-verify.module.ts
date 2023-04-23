import { Module, Global } from '@nestjs/common';
import TokenIsVerified from './token-verify.service';
import { TokenStorageModule } from './token-storage.module';

@Global()
@Module({
    imports: [TokenStorageModule],
    providers: [TokenIsVerified],
    exports: [TokenIsVerified],
})
export class TokenModule {}