import { ChatMemberStatus } from "@prisma/client";

export class updateChatMemberStatusDto {
    readonly roomName : string;
    readonly memberId: number;
    readonly duration: number;
    readonly status : ChatMemberStatus;
  }