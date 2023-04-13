import { ForbiddenException, Get, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { WsException } from "@nestjs/websockets";
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import axios from "axios";
import { OAuth2Client } from 'oauth2';


const logger = new Logger("AuthService");

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // create(), findUnique()
    private jwt: JwtService, // signAsync()
    private config: ConfigService, // JWT_SECRET
  ) { }

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
          username: dto.username,
          hash
        }
      });

      // Return the saved user
      return this.signToken(user.id, user.username);
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
    // Find the user by username
    if (!dto.username) {
      logger.error("signin: username is required");
      return null;
    }
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username
      }
    });

    Logger.log(dto.username);

    // If user does not exist, throw exception
    if (!user)
      throw new ForbiddenException("Credentials incorrect, user not found");

    // Compare password
    const passMatches = await argon.verify(user.hash, dto.password);

    // If password incorrect, throw exception
    if (!passMatches)
      throw new ForbiddenException("Credentials incorrect, bad pass");

    // Return the signed token for the user
    return this.signToken(user.id, user.username);
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

  async enableTwoFactorAuth() {
    const secret = speakeasy.generateSecret({
      name: "42authentification"
    });

    const code = qrcode.toDataURL(secret.otpath_url, function (err, data) {
      console.log(data);
    })
    return { secret: secret, qrcode: code }
  }

  async verifyQrCode(base32secret: string, enteredToken: string) {

    const verified = speakeasy.totp.verify({
      secret: base32secret,
      encoding: 'base32',
      token: enteredToken
    });
    if (verified)
      return { validated: true };
    return { validated: false };
  }


  async getAuht42(authorization_code: string) {

    const UID = "u-s4t2ud-51fb382cccb5740fc1b9129a3ddacef8324a59dc4c449e3e8ba5f62acb2079b6"
    const SECRET = "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";
    const API_BASE_URL = "https://api.intra.42.fr/oauth/token";
    const API_42_URL = "https://api.intra.42.fr";

    const response = await axios.post(API_BASE_URL, {
      grant_type: 'client_credentials',
      client_id: UID,
      client_secret: SECRET,
    });


   //console.log("CLIENT here TOKEN ", response)
    // Get an access token
    console.log("HERE IS MY TOKEN FROM 42:", response.data.access_token);

    const response2 = await axios.get(`${API_42_URL}/v2/cursus`, {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    });

    console.log("Cursus 42", response2);

    return  response.data.access_token;

  }

}
