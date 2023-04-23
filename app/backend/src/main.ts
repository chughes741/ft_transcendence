import { Logger, ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { AppModule } from "./app.module";
import { join } from "path";
import * as session from "express-session";
import * as passport from "passport";

import config from "./config";
import {
  PrismaClientExceptionFilterHttp,
  PrismaClientExceptionFilterWs
} from "./prisma-client-exception.filter";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  // Use the socket.io WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Register the PrismaClientExceptionFilter as a WebSocket filter
  app.useGlobalFilters(new PrismaClientExceptionFilterWs());

  // Use the HTTP adapter
  app.enableCors();
  const { httpAdapter } = app.get(HttpAdapterHost);

  httpAdapter.get("/img/*", (req, res) => {
    const imagePath = join(__dirname, "..", "img", req.params[0]).replace(
      "/dist",
      ""
    );
    res.sendFile(imagePath);
  });

  // Register the PrismaClientExceptionFilter as a HTTP filter
  app.useGlobalFilters(new PrismaClientExceptionFilterHttp(httpAdapter));

  //Cochonnerie
  app.useStaticAssets(join(__dirname, "..", "img"), {
    prefix: "/img"
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  await app.listen(config.port);
  Logger.log("Application listening on port " + config.port);
}
bootstrap();
