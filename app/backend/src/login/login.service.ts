import { Injectable } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class LoginService {
  /**
   *
   * @param loginDto
   */
  login(loginDto: LoginDto) {
    // return jwt token
  }

  /**
   *
   * @param loginDto
   */
  signup(loginDto: LoginDto) {
    //Check if username already exists
  }
}
