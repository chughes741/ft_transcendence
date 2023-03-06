import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@WebSocketGateway()
export class GameGateway {
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('createGame')
  create(@MessageBody() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @SubscribeMessage('findAllGame')
  findAll() {
    return this.gameService.findAll();
  }

  @SubscribeMessage('findOneGame')
  findOne(@MessageBody() id: number) {
    return this.gameService.findOne(id);
  }

  @SubscribeMessage('updateGame')
  update(@MessageBody() updateGameDto: UpdateGameDto) {
    return this.gameService.update(updateGameDto.id, updateGameDto);
  }

  @SubscribeMessage('removeGame')
  remove(@MessageBody() id: number) {
    return this.gameService.remove(id);
  }
}
