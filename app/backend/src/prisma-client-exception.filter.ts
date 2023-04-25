import { ArgumentsHost, Catch, HttpStatus, Logger } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Prisma } from "@prisma/client";
import { Response } from "express";

const logger = new Logger("PrismaClientExceptionFilter");

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilterHttp extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    logger.error(
      "Problem with HTTP PrismaClientExceptionFilter",
      exception.message
    );
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
    logger.warn("Problem with WS PrismaClientExceptionFilter", exception);
    const client = host.switchToWs().getClient();
    let message = exception.message.replace(/\n/g, "");

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
