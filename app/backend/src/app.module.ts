import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";

import { join } from "path";
import { ChatModule } from "./chat/chat.module";
import { GameModule } from "./game/game.module";
import { ProfileModule } from "./profile/profile.module";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UserConnectionsService } from "./user-connections.service";
import { ImgTransferModule } from "./imgtransfer/imgtransfer.module";
import { ImgTransferController } from "./imgtransfer/imgtransfer.controller";
import { ImgTransferService } from "./imgtransfer/imgtransfer.service";
import { TokenModule } from "./tokenstorage/token-verify.module";

/** Used for src/... import paths */
require("tsconfig-paths");

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "..", "frontend", "build")
    }),
    ChatModule,
    GameModule,
    ImgTransferModule,
    ProfileModule,
    PrismaModule,
    AuthModule,
    TokenModule,
    ConfigModule.forRoot({
      envFilePath: "../.env",
      // validationSchema: configValidationSchema,
      isGlobal: true // Expose the module globally
    }) // Loads env vars. Uses dotenv library under the hood
  ],
  controllers: [ImgTransferController],
  providers: [PrismaService, UserConnectionsService, ImgTransferService]
})
export class AppModule {}
