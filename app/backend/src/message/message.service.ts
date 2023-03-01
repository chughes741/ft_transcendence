import { Injectable } from "@nestjs/common";
import { CreateMessageDto } from "./dto/create-message.dto";
import { Message } from "./entities/message.entity";

@Injectable()
export class MessageService {
  messages: Message[] = [{ name: "Cole", message: "hello" }];
  clientToUser = {};

  /**
   *
   * @param name
   * @param clientId
   * @returns
   */
  identify(name: string, clientId: string) {
    // TODO add to db
    this.clientToUser[clientId] = name;

    return Object.values(this.clientToUser);
  }

  /**
   *
   * @param clientId
   * @returns
   */
  getClientName(clientId: string) {
    // TODO query db
    return this.clientToUser[clientId];
  }

  /**
   *
   * @param createMessageDto
   * @returns
   */
  create(createMessageDto: CreateMessageDto) {
    // TODO push to db
    const message = { ...createMessageDto };
    this.messages.push(message);
    return message;
  }

  /**
   *
   * @returns
   */
  findAll() {
    // TODO query db
    return this.messages;
  }

  /**
   *
   * @returns
   */
  joinRoom() {
    return `TODO`;
  }

  /**
   *
   * @returns
   */
  typing() {
    return `TODO`;
  }
}
