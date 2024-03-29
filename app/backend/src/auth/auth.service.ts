import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthEntity, AuthRequest, UserEntity } from "./dto";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import axios from "axios";
import { Token } from "../tokenstorage/token-storage.service";
import { UserStatus } from "@prisma/client";
import TokenIsVerified from "src/tokenstorage/token-verify.service";

const logger = new Logger("AuthService");

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // create(), findUnique()
    private tokenClass: TokenIsVerified
  ) {}

  async signup(
    req: AuthRequest
  ): Promise<
    { access_token: string } | { errorCode: number; errorMessage: string }
  > {
    return { access_token: "new access token" };
  }

  async callToSignup(req: AuthRequest) {
    return req;
  }

  async signin(data: UserEntity): Promise<UserEntity> {
    const user: UserEntity = await this.prisma.getUserbyMail(data.email);
    //IF THERE IS NO USER
    if (!user) {
      logger.debug("Signin first time");
      const newuser: UserEntity = await this.prisma.addUser(data);
      newuser.firstConnection = true;
      return newuser;
    }
    logger.debug("Returning user email: ", data.email);
    await this.prisma.user.update({
      where: { email: data.email },
      data: { status: UserStatus.ONLINE }
    });
    user.firstConnection = false;
    return user;
  }

  async enableTwoFactorAuth() {
    const secret = speakeasy.generateSecret({
      name: "42authentification"
    });
    const code = await qrcode.toDataURL(secret.otpauth_url);
    return { secret: secret.base32, qrcode: code };
  }

  generateToken(secret) {
    const token = speakeasy.totp({
      secret: secret,
      encoding: "base32"
    });
    return token;
  }

  async confirmID(previousID: string, newID: string) {
    const token: Token = await this.tokenClass.tokenStorage.getTokenbySocket(
      previousID
    );
    await this.tokenClass.tokenStorage.removeToken(previousID);
    if (token !== undefined) token.token_type = "bearer";
    await this.tokenClass.tokenStorage.addToken(newID, token);
    return;
  }

  async verifyQrCode(
    base32secret: string,
    enteredToken: string,
    username: string
  ) {
    if (base32secret === "null") {
      const secret = await this.prisma.getQrCode(username);
      const verified = await speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: enteredToken
      });
      if (verified) return { validated: true };
      return { validated: false };
    } else {
      const verified = await speakeasy.totp.verify({
        secret: base32secret,
        encoding: "base32",
        token: enteredToken
      });
      if (verified) {
        try {
          await this.prisma.setQrCode(username, base32secret);
          await this.prisma.update2FA(username);
          return { validated: true };
        } catch (error) {
          logger.error(error);
        }
      }
      return { validated: false };
    }
  }

  //Swithc on/off enable 2fa
  async update2FA(username: string) {
    const enable: boolean = await this.prisma.update2FA(username);
    return { enable2fa: enable };
  }

  //Will refresh token
  async checkToRefresh(token: Token): Promise<Token> {
    if (token.expires_in < 7000)
      return await this.tokenClass.tokenStorage.refresh42Token(token);
    if (Math.floor(Date.now() / 1000) > token.created_at + 100)
      return await this.tokenClass.tokenStorage.refresh42Token(token);
    return token;
  }

  async getAuht42(
    clientId: string,
    authorization_code: string
  ): Promise<AuthEntity | string> {
    const UID = process.env.UID;
    const SECRET = process.env.SECRET;
    const API_42_URL = process.env.API_42_URL;
    const REDIRECT_URI = process.env.REDIRECT_URI;

    try {
      const response = await axios.post("https://api.intra.42.fr/oauth/token", {
        grant_type: "authorization_code",
        client_id: UID,
        client_secret: SECRET,
        redirect_uri: REDIRECT_URI,
        code: authorization_code
      });
      const data = response.data;
      // Get an access token

      let token = new Token(
        data.access_token,
        data.refresh_token,
        data.token_type,
        data.expires_in,
        data.scope,
        data.created_at
      );

      token = await this.checkToRefresh(token);

      const response2 = await axios.get(`${API_42_URL}/v2/me`, {
        headers: {
          Authorization: `Bearer ${token.access_token}`
        }
      });
      const userName = response2.data.login + response2.data.id;
      token.token_type = "transiting";
      this.tokenClass.tokenStorage.addToken(clientId, token);
      const user = await this.signin({
        username: userName,
        avatar: response2.data.image.link,
        firstName: response2.data.first_name,
        lastName: response2.data.last_name,
        email: response2.data.email,
        status: UserStatus.ONLINE
      });
      const authEntity: AuthEntity = {
        user: user,
        token: token.access_token
      };
      return authEntity;
    } catch (error) {
      logger.debug("Axios request silenced");
      return JSON.stringify({ error: error, ok: false });
    }
  }

  async changeName(current: string, newName: string): Promise<boolean> {
    return this.prisma.changeUserName(current, newName);
  }

  async deleteToken(socketID: string) {
    this.tokenClass.tokenStorage.removeToken(socketID);
  }

  async getEnable2fa(username: string) {
    if ((await this.prisma.getEnable2Fa(username)) === true)
      return JSON.stringify({ validated: true });
    return JSON.stringify({ validated: false });
  }

  async getCredentials() {
    return JSON.stringify({
      CLIENT_ID: process.env.UID,
      REDIRECT_URI: process.env.REDIRECT_URI
    });
  }
}
