import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@WebSocketGateway()
export class AuthGateway {
  constructor(private readonly authService: AuthService) {}

  @SubscribeMessage('createAuth')
  create(@MessageBody() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @SubscribeMessage('findAllAuth')
  findAll() {
    return this.authService.findAll();
  }

  @SubscribeMessage('findOneAuth')
  findOne(@MessageBody() id: number) {
    return this.authService.findOne(id);
  }

  @SubscribeMessage('updateAuth')
  update(@MessageBody() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(updateAuthDto.id, updateAuthDto);
  }

  @SubscribeMessage('removeAuth')
  remove(@MessageBody() id: number) {
    return this.authService.remove(id);
  }
}
