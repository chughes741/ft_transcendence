import {
  Body,
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  Logger
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubscribeMessage } from "@nestjs/websockets";
import { PrismaClientExceptionFilterHttp } from "../prisma-client-exception.filter";
import { AuthService } from "./auth.service";
import { GetUser } from "./decorators";
import { AuthRequest } from "./dto";
import { Token } from "src/token-storage.service";

const logger = new Logger("AuthController");

@UseFilters(new PrismaClientExceptionFilterHttp())
@Controller("auth")
@ApiTags("auth")
export class AuthController {
  // Here, private means that authService is a member attribute
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post("signup")
  signup(@Body() dto: AuthRequest) {
    // The barren export pattern in ./dto/index.ts allows automatic exposition

    logger.log({
      dto
    }); // Creates an object and assigns it

    return this.authService.signup(dto);
  }

  @Get("signup")
  signup_ft(@Body() dto: AuthRequest) {
    logger.log("Succesfully redirected!");

    logger.log({
      dto
    }); // Creates an object and assigns it

    return dto;
  }

  @Get("signin")
  signin_ft(@GetUser() user) {
    // The barren export pattern in ./dto/index.ts allows automatic exposition

    logger.log("Succesfully signed in!");

    logger.log({
      user
    }); // Creates an object and assigns it

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post("signin")
  signin(@Body() dto: AuthRequest) {
    return ;
    //return this.authService.signin(dto);
  }

  @Post("refresh")
  @SubscribeMessage("refresh")
  async refreshToken(@Body("refresh_token") refresh_token: Token) {
    return this.authService.refreshToken(refresh_token);
  }

  @Get("token")
  async generate42Token(
    @Query("code") authorizationCode: string,
    @Query("socketId") socketId: string
  ) {
    logger.log("Inside Generate42Token");
    logger.log("Authorisation code : ", authorizationCode);
    logger.log("Socket ID: ", socketId);
    return await this.authService.getAuht42(socketId, authorizationCode);
  }

  @Get("qrCode")
  async generateQrCode() 
  {
    console.log("INSIDE QRCODE FUNCTION");
    return await this.authService.enableTwoFactorAuth();
  }

  @Get("verifyQrCode")
  async verifyQrCode(
    @Query("secret") secret: string,
    @Query("code") code: string
  ) 
  {
    console.log("INSIDE QRCODE  VERIFYFUNCTION", secret, code);
    return await this.authService.verifyQrCode(secret, code);
  }



  @Get("authorisationURL")
  async generateAuth42Url() {
    const REDIRECT_URI = "http://localhost:3000/";
    const CLIENT_ID =
      "u-s4t2ud-51fb382cccb5740fc1b9129a3ddacef8324a59dc4c449e3e8ba5f62acb2079b6";
    return `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  }
}
