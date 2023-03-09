import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

import * as session from "express-session";
import * as passport from "passport";

import config from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true // Strips out unwanted request elements from a dto
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Bookmarks API")
    .setDescription("Simple API for a bookmarks website")
    .setVersion("1.0")
    .addTag("bookmarks")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  app.use(
    session({ resave: false, saveUninitialized: false, secret: "secret" })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(config.port);
}
bootstrap();
