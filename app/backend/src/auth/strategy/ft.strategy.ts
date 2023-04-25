import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Strategy, Profile, VerifyCallback } from "passport-42";

// // This class is also a provider
// @Injectable()
// // set as 'jwt' by default, but any other identifier can be passed
// @Injectable()
// export class FortyTwoStrategy extends PassportStrategy(Strategy, 'ft') {
//   constructor() {
//     super({
//       authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
//       tokenURL: 'https://api.intra.42.fr/oauth/token',
//       clientSecret: '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',
//       clientID: 'u-s4t2ud-ebf7932d3431e92be8ab844c85ed9bbd6a6e7a135d40f2a7628b29b804b75640',
//       redirect_uri: 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ebf7932d3431e92be8ab844c85ed9bbd6a6e7a135d40f2a7628b29b804b75640&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fauth%2Fsignin&response_type=code',
//       callbackURL: 'http://localhost:3333/auth/signin',
//       passReqToCallback: true,
//       scope: ['public'],
//     });
//   }

//   async validate(
//     request: any,
//     accessToken: string,
//     refreshToken: string,
//     profile: any,
//     done: any,
//   ) {
//     const { id, username, displayName, emails } = profile;
//     const user = {
//       id,
//       username,
//       displayName,
//       email: emails[0].value,
//       accessToken,
//       refreshToken,
//     };
//     logger.debug(user);

//     done(null, user);
//   }
// }

const logger = new Logger("JwtStrategy");

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, "ft") {
  constructor(private readonly config: ConfigService) {
    super({
      clientSecret:
        "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",
      clientID:
        "u-s4t2ud-ebf7932d3431e92be8ab844c85ed9bbd6a6e7a135d40f2a7628b29b804b75640",
      redirect_uri:
        "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ebf7932d3431e92be8ab844c85ed9bbd6a6e7a135d40f2a7628b29b804b75640&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fauth%2Fsignin&response_type=code",
      callbackURL: "http://localhost:3333/auth/signin",
      passReqToCallback: true
    });
  }

  // validate(
  //   accessToken: string,
  //   refreshToken: string,
  //   profile: FortyTwoUser,
  // ): FortyTwoUser {
  async validate(
    request: { session: { accessToken: string } },
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<null | VerifyCallback> {
    request.session.accessToken = accessToken;
    logger.debug("accessToken:", accessToken, "refreshToken:", refreshToken);
    // In this example, the user's 42 profile is supplied as the user
    // record.  In a production-quality application, the 42 profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return done(null, profile);
  }
}
