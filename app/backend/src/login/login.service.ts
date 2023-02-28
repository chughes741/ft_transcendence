import { Injectable } from '@nestjs/common';
import { Login } from './entities/login.entity';

@Injectable()
export class LoginService {
  getHello(): Login {
    return { message: "This is the login page yo!"};
  }
}
