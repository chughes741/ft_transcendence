import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(config: ConfigService) {
        // Will call the constructor of the extended class
        super({
            datasources: {
                db: {
                    url: config.get('DATABASE_URL'),
                },
            },
        });
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
            this.bookmark.deleteMany(),
            this.user.deleteMany(),
        ])
    }
    addUser() {}
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
