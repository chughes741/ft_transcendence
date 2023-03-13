import { ArgumentsHost, Catch, HttpStatus, Logger } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Prisma } from "@prisma/client";
import { Response } from "express";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilterHttp extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    Logger.error("Oopsie fucky is happening in HTTP Exception filter");
    console.error(exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, "");

    switch (exception.code) {
      case "P2002": {
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: message
        });
        break;
      }
      default:
        // default 500 error code
        super.catch(exception, host);
        break;
    }
  }
}

import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch(WsException)
export class PrismaClientExceptionFilterWs extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    console.log("Oopsie fucky is happening in WS Exception filter");
    Logger.error(exception);
    Logger.error(host);
    const client = host.switchToWs().getClient();
    let message = exception.message.replace(/\n/g, "");

    Logger.log(message);
    Logger.log(exception.getError());

    switch (exception.getError()) {
      case "P2002": {
        const status = "conflict";
        message += " : @unique property is already in use.'";
        client.emit("error", {
          status,
          message
        });
        break;
      }
      case "P2009": {
        const status = "Missing required value";
        message +=
          ": Attempting to add table entry while missing required field.'";
        client.emit("error", {
          status,
          message
        });
        break;
      }
      default:
        super.catch(exception, host);
        break;
    }
  }
}
