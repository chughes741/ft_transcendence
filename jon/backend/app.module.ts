import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


//Modules
import { RouterModule } from './router/router.module';
// import { LoginModule } from './login/login.module';
// import { ChatModule } from './chat/chat.module';
// import { GameModule } from './game/game.module';
// import { ProfileModule } from './profile/profile.module';

//Controllers
// import { AppController } from './app.controller.ts';

@Module({
	//Import modules
  imports: [
    ServeStaticModule.forRoot({rootPath: join(__dirname, '..', '..', 'frontend', 'build'),}),
		RouterModule,
  ],
})
export class AppModule {}