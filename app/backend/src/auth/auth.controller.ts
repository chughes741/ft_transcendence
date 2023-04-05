import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubscribeMessage } from "@nestjs/websockets";
import { PrismaClientExceptionFilterHttp } from "../prisma-client-exception.filter";
import { AuthService } from "./auth.service";
import { GetUser } from "./decorators";
import { AuthDto } from "./dto";

@UseFilters(new PrismaClientExceptionFilterHttp())
@Controller("auth")
@ApiTags("auth")
export class AuthController {
  // Here, private means that authService is a member attribute
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post("signup")
  signup(@Body() dto: AuthDto) {
    // The barren export pattern in ./dto/index.ts allows automatic exposition

    console.log({
      dto
    }); // Creates an object and assigns it

    return this.authService.signup(dto);
  }

  @Get("signup")
  signup_ft(@Body() dto: AuthDto) {
    console.log("Succesfully redirected!");

    console.log({
      dto
    }); // Creates an object and assigns it

    return dto;
  }

  @Get("signin")
  signin_ft(@GetUser() user) {
    // The barren export pattern in ./dto/index.ts allows automatic exposition

    console.log("Succesfully signed in!");

    console.log({
      user
    }); // Creates an object and assigns it

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post("signin")
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @Post("refresh")
  @SubscribeMessage("refresh")
  async refreshToken(@Body("refresh_token") refresh_token: string) {
    return this.authService.refreshToken(refresh_token);
  }
}
