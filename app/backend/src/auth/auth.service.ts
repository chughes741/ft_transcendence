import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // create(), findUnique()
    private jwt: JwtService, // signAsync()
    private config: ConfigService // JWT_SECRET
  ) {}

  async signup(
    dto: AuthDto
  ): Promise<
    { access_token: string } | { errorCode: number; errorMessage: string }
  > {
    try {
      // Generate the password hash
      const hash = await argon.hash(dto.password);

      // Save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash
        }
      });

      // Return the saved user
      return this.signToken(user.id, user.email);
    } catch (error) {
      // Check if the error comes from Prisma
      if (error instanceof PrismaClientKnownRequestError) {
        // Prisma error code for duplicate fields
        if (error.code === "P2002") {
          throw new ForbiddenException("Credentials taken, biatch");
        }
      }

      // Otherwise throw it back. Hot potato, baby.
      // throw error;
      return { errorCode: 1, errorMessage: "Error" };
    }
  }

  async callToSignup(dto: AuthDto) {
    const ret = await this.signup(dto);
    if (ret) throw new WsException(" invalid credentials");

    return dto;
  }

  async signin(dto: AuthDto) {
    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });

    Logger.log(dto);

    // If user does not exist, throw exception
    if (!user)
      throw new ForbiddenException("Credentials incorrect, user not found");

    // Compare password
    const passMatches = await argon.verify(user.hash, dto.password);

    // If password incorrect, throw exception
    if (!passMatches)
      throw new ForbiddenException("Credentials incorrect, bad pass");

    // Return the signed token for the user
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: string,
    email: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      id: userId, // identifies the principal that is the subject of the JWT
      email
    };
    const secret = this.config.get("JWT_SECRET");

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: "15m",
      secret: secret
    });

    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: "7d",
      secret: secret
    });

    // FIXME: Uncomment this to enable refresh token storage
    // // Store the refresh token in the database
    // await this.prisma.refreshToken.create({
    //   data: {
    //     token: refresh_token,
    //     user: {
    //       connect: {
    //         id: userId
    //       }
    //     },
    //     expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    //   }
    // });

    return {
      access_token, // creates a string object
      refresh_token
    };
  }

  async refreshToken(refresh_token: string): Promise<{ access_token: string }> {
    try {
      const secret = this.config.get("JWT_SECRET");
      const payload = this.jwt.verify(refresh_token, { secret });

      // FIXME: Uncomment this to enable refresh token storage
      // const storedRefreshToken = await this.prisma.refreshToken.findUnique({
      //   where: { token: refresh_token }
      // });

      // if (!storedRefreshToken || storedRefreshToken.expires_at < new Date()) {
      //   throw new ForbiddenException("Invalid refresh token");
      // }

      // // Revoke the refresh token by removing it from the database
      // await this.prisma.refreshToken.delete({
      //   where: { token: refresh_token }
      // });

      const newPayload = {
        id: payload.id,
        email: payload.email
      };

      const access_token = await this.jwt.signAsync(newPayload, {
        expiresIn: "15m",
        secret: secret
      });

      return {
        access_token
      };
    } catch (err) {
      throw new WsException("Invalid refresh token");
    }
  }
}
