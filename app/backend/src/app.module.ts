import { Module } from "@nestjs/common";
import { AppService } from "./app.service";

import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { ChatModule } from "./chat/chat.module";
import { GameModule } from "./game/game.module";
import { ProfileModule } from "./profile/profile.module";
import { LoginModule } from "./login/login.module";
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "frontend", "build")
    }),
    ChatModule,
    GameModule,
    ProfileModule,
    LoginModule,
    PrismaModule
  ],
  controllers: [],
  providers: [AppService, PrismaService]
})
export class AppModule {}
