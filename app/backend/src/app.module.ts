import { Module } from "@nestjs/common";
import { AppService } from "./app.service";

import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { ChatModule } from "./chat/chat.module";
import { GameModule } from "./game/game.module";
import { ProfileModule } from "./profile/profile.module";
import { LoginModule } from "./login/login.module";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";
import { UserConnectionsService } from "./user-connections.service";

/** Used for src/... import paths */
require('tsconfig-paths')

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "..", "frontend", "build")
    }),
    ChatModule,
    GameModule,
    ProfileModule,
    LoginModule,
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: "../.env",
      // validationSchema: configValidationSchema,
      isGlobal: true // Expose the module globally
    }) // Loads env vars. Uses dotenv library under the hood
  ],
  controllers: [],
  providers: [AppService, PrismaService, UserConnectionsService]
})
export class AppModule {}
