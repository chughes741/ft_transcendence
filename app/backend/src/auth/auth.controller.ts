import {
  Body,
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  Logger,
  UseGuards
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubscribeMessage } from "@nestjs/websockets";
import { PrismaClientExceptionFilterHttp } from "../prisma-client-exception.filter";
import { AuthService } from "./auth.service";
import { GetUser } from "./decorators";
import { AuthRequest, UserEntity } from "./dto";
import { Token } from "src/tokenstorage/token-storage.service";
import { UserStatus } from "@prisma/client";
import TokenIsVerified from "src/tokenstorage/token-verify.service";

const logger = new Logger("AuthController");

@UseFilters(new PrismaClientExceptionFilterHttp())
@Controller("auth")
@ApiTags("auth")
export class AuthController {
  // Here, private means that authService is a member attribute
  constructor(private authService: AuthService) {}

  @Post("testing")
  @UseGuards(TokenIsVerified)
  public async functionTesttoCall() {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("signup")
  signup(@Body() dto: AuthRequest) {
    // The barren export pattern in ./dto/index.ts allows automatic exposition
    return this.authService.signup(dto);
  }

  @Get("signup")
  signup_ft(@Body() dto: AuthRequest) {
    logger.debug("Succesfully redirected!");
    return dto;
  }

  @Get("signin")
  signin_ft(@GetUser() user) {
    // The barren export pattern in ./dto/index.ts allows automatic exposition
    logger.debug("Succesfully signed in!", { user });
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post("signin")
  signin(@Body() dto: AuthRequest) {
    const info: UserEntity = {
      username: dto.username,
      avatar: "",
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      status: UserStatus.ONLINE
    };
    return this.authService.signin(info);
  }

  @Post("refreshToken")
  @SubscribeMessage("refresh")
  async refreshToken(@Body("refresh_token") refresh_token: Token) {
    return;
  }

  @Post("confirmID")
  async confirmID(
    @Query("previousID") previousID: string,
    @Query("newID") newID: string
  ) {
    logger.degub(`Confirming new Socket ID : [${newID}]`);
    this.authService.confirmID(previousID, newID);
    return;
  }

  @Get("token")
  async generate42Token(
    @Query("code") authorizationCode: string,
    @Query("socketId") socketId: string
  ) {
    logger.debug("Inside Generate42Token");
    return await this.authService.getAuht42(socketId, authorizationCode);
  }

  @Get("qrCode")
  async generateQrCode() {
    logger.debug("Generating QrCode");
    return await this.authService.enableTwoFactorAuth();
  }

  @Get("getCredentials")
  async getCredentials() {
    logger.debug("Get Credentials");
    return await this.authService.getCredentials();
  }

  @Get("changeUsername")
  async changeUsername(
    @Query("current") currentName: string,
    @Query("newname") newName: string
  ) {
    return await this.authService.changeName(currentName, newName);
  }

  @Get("verifyQrCode")
  @UseGuards(TokenIsVerified)
  async verifyQrCode(
    @Query("secret") secret: string,
    @Query("code") code: string,
    @Query("username") username
  ) {
    return await this.authService.verifyQrCode(secret, code, username);
  }

  @Get("update2FA")
  @UseGuards(TokenIsVerified)
  async update2FA(@Query("username") userName: string) {
    return await this.authService.update2FA(userName);
  }

  @Post("deleteToken")
  async deleteToken(@Query("socketId") socketId: string) {
    logger.debug("Token deletion engage");

    this.authService.deleteToken(socketId);
    return;
  }

  @Get("getEnable2fa")
  @UseGuards(TokenIsVerified)
  async getEnable2fa(@Query("username") username: string) {
    return await this.authService.getEnable2fa(username);
  }
}
