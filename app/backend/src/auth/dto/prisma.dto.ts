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
function addUserDto(dto: UserDto) {
  return "addUserDto logic";
}
function editUserDto(dto: UserDto) {
  return "editUserDto logic";
}
function deleteUserDto(dto: UserDto) {
  return "deleteUserDto logic";
}

export class ProfileDto {
  uuid: string;
  avatar?: string;
  username?: string;
  status?: UserStatus;
}
function addProfileDto(dto: ProfileDto) {
  return "addProfileDto logic";
}
function editProfileDto(dto: ProfileDto) {
  return "editProfileDto logic";
}

export class ChatMemberDto {
  uuid: string;
  roomID: string;
  avatar?: string;
  rank?: ChatMemberRank;
  status?: ChatMemberStatus;
}
function addChatMemberDto(dto: ChatMemberDto) {
  return "addChatMemberDto logic";
}
function editChatMemberDto(dto: ChatMemberDto) {
  return "editChatMemberDto logic";
}
function deleteChatMemberDto(dto: ChatMemberDto) {
  return "deleteChatMemberDto logic";
}

export class MessageDto {
  senderId: string;
  content: string;
  roomId: number;
}
export class ChatRoomDto {
  name?: string;
  status?: ChatRoomStatus;
  password?: string;
  owner?: string;
}
function addChatRoomDto(dto: ChatRoomDto) {
  return "addChatRoomDto logic";
}
function editChatRoomDto(dto: ChatRoomDto) {
  return "editChatRoomDto logic";
}
function deleteChatRoomDto(dto: ChatRoomDto) {
  return "deleteChatRoomDto logic";
}

export class PlayerDto {
  uuid: string;
  score: number;
}
function addPlayerDto(dto: PlayerDto) {
  return "addPlayerDto logic";
}
