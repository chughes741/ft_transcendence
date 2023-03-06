import { Module } from "@nestjs/common";
import { AppService } from "./app.service";

import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { GameModule } from "./game/game.module";
import { ProfileModule } from "./profile/profile.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "frontend", "build"),
    }),
    AuthModule,
    ChatModule,
    GameModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
