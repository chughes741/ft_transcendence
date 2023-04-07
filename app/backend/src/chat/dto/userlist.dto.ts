import { ChatMemberRank, ChatMemberStatus } from "@prisma/client";

export class updateChatMemberStatusDto {
    readonly roomName : string;
    readonly memberId: number;
    readonly duration: number;
    readonly status : ChatMemberStatus;
  }

  export class kickMemberDto {
    readonly ChatMemberToKickId : number;
    readonly ChatMemberToKickName : string;
    readonly roomName : string;
    readonly memberRequestingRank : ChatMemberRank;
    readonly memberToKickStatus : ChatMemberRank;
  }