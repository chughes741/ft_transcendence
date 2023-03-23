import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import {
  ChatMemberRank,
  ChatMemberStatus,
  ChatRoomStatus,
  UserStatus
} from "@prisma/client";

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "Login email"
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Login password"
  })
  password: string;
}

/**
 * TODO:
 *  - write addUserDto
 *  - write editUserDto
 *  - write deleteUserDto
 *  - write addProfileDto
 *  - write editProfileDto
 *
 *  - write addChatMemberDto
 *  - write editChatMemberDto
 *  - write deleteChatMemberDto
 *  - write addChatRoomDto
 *  - write deleteChatRoomDto
 *  - write addPlayerDto
 *  - write editChatRoomDto
 *
 */

export class UserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export class ProfileDto {
  uuid: string;
  avatar?: string;
  username?: string;
  status?: UserStatus;
}

export class ChatMemberDto {
  uuid: string;
  roomID: string;
  avatar?: string;
  rank?: ChatMemberRank;
  status?: ChatMemberStatus;
}

export class MessageDto {
  senderId: string;
  content: string;
  roomId: number;
}

export class ChatRoomDto {
  name: string;
  status: ChatRoomStatus;
  password?: string;
  owner?: string;
}

export class PlayerDto {
  uuid: string;
  score: number;
}
