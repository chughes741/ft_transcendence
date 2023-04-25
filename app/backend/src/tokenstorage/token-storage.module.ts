import { Global, Module } from "@nestjs/common";
import { TokenStorageService } from "./token-storage.service";

@Global()
@Module({
  providers: [TokenStorageService],
  exports: [TokenStorageService]
})
export class TokenStorageModule {}
