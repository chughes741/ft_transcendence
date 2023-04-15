import { ChatMemberRank, ChatMemberStatus } from "@prisma/client";

export class UpdateChatMemberRequest {
  queryingUser: string;
  usernameToUpdate: string;
  memberToUpdateUuid?: number;
  roomName: string;
  status: ChatMemberStatus;
  queryingMemberRank: ChatMemberRank;
  memberToUpdateRank: ChatMemberRank;
  duration?: number; // in minutes
}

export class KickMemberRequest {
  memberToKickUUID?: number;
  memberToKickUsername: string;
  memberToKickRank: ChatMemberRank;
  roomName: string;
  queryingMemberRank: ChatMemberRank;
}
