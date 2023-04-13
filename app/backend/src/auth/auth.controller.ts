import {
  Body,
  Controller,
  Get,
  Query,
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

  @Get("token")
  async generate42Token(@Query("code") authorizationCode: string) {
    console.log("Inside Generate42Token");
    console.log("Authorisation code : " + authorizationCode);
    const token = await this.authService.getAuht42(authorizationCode);
    return { token };
  }

  @Get("authorisationURL")
  async generateAuth42Url() {
    const REDIRECT_URI = "http://localhost:3000/";
    const CLIENT_ID =
      "u-s4t2ud-51fb382cccb5740fc1b9129a3ddacef8324a59dc4c449e3e8ba5f62acb2079b6";
    return `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  }
}
