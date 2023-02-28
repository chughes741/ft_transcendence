import { Controller, Get } from '@nestjs/common';
import { LoginService } from './login.service';
import { Login } from './entities/login.entity';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Get()
  getHello(): Login {
    return this.loginService.getHello();
  }
}
