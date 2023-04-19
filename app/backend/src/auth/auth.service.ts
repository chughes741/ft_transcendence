import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthEntity, AuthRequest, UserEntity } from "./dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import axios from "axios";
import { Token, TokenStorageService } from "../token-storage.service";
import { UserStatus } from "@prisma/client";
import { boolean } from "joi";

const logger = new Logger("AuthService");

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // create(), findUnique()
    private jwt: JwtService, // signAsync()
    private config: ConfigService, // JWT_SECRET
    private tokenStorage: TokenStorageService
  ) {}

  async signup(
    req: AuthRequest
  ): Promise<
    { access_token: string } | { errorCode: number; errorMessage: string }
  > 
  {
    return {access_token : "new access token"}
  }

  async callToSignup(req: AuthRequest) {

    return req;
  }

  async signin(data : UserEntity) : Promise<UserEntity> {

    logger.log ("Signin USER ENTITY: " , data);
    const user : UserEntity = await this.prisma.getUserbyMail(data.email);
    //IF THERE IS NO USER
    if(!user)
    {

      const newuser : UserEntity = await this.prisma.addUser(data)
      newuser.firstConnection = true;
      return newuser;
    }
    user.firstConnection = false;

    //HARDCODED FOR TRUE: NEEDS TO BE REMOVED
    //user.enable2fa = true;
    
    return user;
  }

  //Might implement or not
  async refreshToken(refresh_token: Token): Promise<Token> {
    

    return ;
  }

  async enableTwoFactorAuth() {
    const secret = speakeasy.generateSecret({
      name: "42authentification"
    });

    const code = await qrcode.toDataURL(secret.otpauth_url);
    console.log("QRCODE MAYBE :", code)
    return { secret: secret.base32, qrcode: code};
  }

  generateToken(secret) {
    const token = speakeasy.totp({
      secret: secret,
      encoding: "base32",
    });
    return token;
  }

  async verifyQrCode(base32secret: string, enteredToken: string) {
    const verified = speakeasy.totp.verify({
      secret: base32secret,
      encoding: "base32",
      token: enteredToken
    });
    console.log("VERIFICATION : ", verified)
    if (verified) return { validated: true };
    return { validated: false };
  }

  async update2FA(username : string) {
    console.log("UPDATE 2FA FOR : ", username)
    
    const enable : boolean = await this.prisma.update2FA(username) 
    return {enable2fa : enable };
  }

  async getAuht42(clientId: string, authorization_code: string) : Promise<AuthEntity> {
    const UID =
      "u-s4t2ud-51fb382cccb5740fc1b9129a3ddacef8324a59dc4c449e3e8ba5f62acb2079b6";
    const SECRET =
      "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";
    const API_BASE_URL = "https://api.intra.42.fr/oauth/token";
    const API_42_URL = "https://api.intra.42.fr";
    const REDIRECT_URI = "http://localhost:3000/";

    const fuckedUpResponse = await axios.post(
      "https://api.intra.42.fr/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: UID,
        client_secret: SECRET,
        redirect_uri: REDIRECT_URI,
        code: authorization_code
      }
    );
    const response = fuckedUpResponse.data;
    // Get an access token

    const token = new Token(
      response.access_token,
      response.refresh_token,
      response.token_type,
      response.expires_in,
      response.scope,
      response.created_at
    );

    const response2 = await axios.get(`${API_42_URL}/v2/me`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });
    const userName = response2.data.login + response2.data.id;

    this.tokenStorage.addToken(clientId, token);
    const theuser = await this.signin({
      username: userName,
      avatar: response2.data.image.link,
      firstName : response2.data.first_name,
      lastName: response2.data.last_name,
      email: response2.data.email,
      status: UserStatus.ONLINE,
    })
    const authEntity : AuthEntity = {
      user :theuser,
      token : token.access_token,
    }
    console.log("AUTHENTITY" ,authEntity)
    return authEntity;
  }

  async TokenIsVerified(
    clientId: string,
    clientToken: string
  ): Promise<boolean> {
    // Check if token is valid
    const token = this.tokenStorage.getToken(clientId);
    if (!token || token.access_token !== clientToken) {
      logger.error("Who TF is that?", clientId);
      return false;
    }
    return true;
  }

  async changeName(current : string, newName : string) : Promise<boolean>{
    return this.prisma.changeUserName(current, newName);
  }

}