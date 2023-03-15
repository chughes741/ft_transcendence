import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

//From tutorial https://www.delightfulengineering.com/blog/nest-websockets/basics
import { NestExpressApplication } from '@nestjs/platform-express';


//Temporarily commented out most of config and disables dotenv
import config from "./config";

async function bootstrap() {
    //using create<NestExpressApplication> as opposed to just create(), from tutorial
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.listen(config.port);
}
bootstrap();