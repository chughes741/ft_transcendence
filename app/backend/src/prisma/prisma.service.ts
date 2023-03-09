import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";
import { UserDto } from "../auth/dto/prisma.dto";
import config from "../config";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    // Will call the constructor of the extended class
    super({
      datasources: {
        db: {
          url: config.database_url
        }
      }
    });
    Logger.log(configService.get("DATABASE_URL"));
  }

  /**
   * To be executed in testing, or to fully cleanup the db.
   * If you're not sure, probs best not to touch it.
   */
  cleanDb() {
    /**
     * Transaction delegates proper deletion order to prisma.
     * Accepts an array of operations.
     */
    return this.$transaction([
      this.chatRoom.deleteMany(),
      this.user.deleteMany(),
      this.profile.deleteMany(),
      this.chatMember.deleteMany(),
      this.message.deleteMany(),
      this.match.deleteMany(),
      this.player.deleteMany()
    ]);
  }
  addUser(dto: UserDto) {}
  editUser() {}
  deleteUser() {}
  addProfile() {}
  editProfile() {}
  addChatMember() {}
  editChatMember() {}
  addChatRoom() {}
  editChatRoom() {}
  deleteChatRoom() {}
  addMessage() {}
  editMessage() {}
  deleteMessage() {}
  addMatch() {}
}
