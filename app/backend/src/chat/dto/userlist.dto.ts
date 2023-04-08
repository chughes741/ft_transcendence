import { ChatMemberRank, ChatMemberStatus } from "@prisma/client";

export class updateChatMemberStatusDto {
  memberRequestRank: ChatMemberRank
  memberToUpdateID: number;
  memberToUpdateRANK: ChatMemberRank;
  changeStatusTo: ChatMemberStatus;
  forRoomName: string;
  Penitence?: Date;
}

export class updateChatMemberRankDto {
  memberRequestRank: ChatMemberRank
  memberToUpdateID: number;
  memberToUpdateRANK: ChatMemberRank;
  changeRankTo: ChatMemberRank;
  forRoomName: string;
}

export class kickMemberDto {
  ChatMemberToKickId: number;
  ChatMemberToKickName: string;
  roomName: string;
  memberRequestingRank: ChatMemberRank;
  memberToKickStatus: ChatMemberRank;
}