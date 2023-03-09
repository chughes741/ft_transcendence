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

function addUserDto(dto: UserDto) {}
function editUserDto(dto: UserDto) {}
function deleteUserDto(dto: UserDto) {}
export class UserDto {
  uuid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

function addProfileDto(dto: ProfileDto) {}
function editProfileDto(dto: ProfileDto) {}
export class ProfileDto {
  uuid: string;
  avatar?: string;
  username?: string;
  status?: UserStatus;
}

function addChatMemberDto(dto: ChatMemberDto) {}
function editChatMemberDto(dto: ChatMemberDto) {}
function deleteChatMemberDto(dto: ChatMemberDto) {}
export class ChatMemberDto {
  uuid: string;
  roomID: string;
  avatar?: string;
  rank?: ChatMemberRank;
  status?: ChatMemberStatus;
}

function addChatRoomDto(dto: ChatRoomDto) {}
function editChatRoomDto(dto: ChatRoomDto) {}
function deleteChatRoomDto(dto: ChatRoomDto) {}
export class ChatRoomDto {
  roomID: string;
  status?: ChatRoomStatus;
  password?: string;
  createdBy?: string;
}

function addPlayerDto(dto: PlayerDto) {}
export class PlayerDto {
  uuid: string;
  score: number;
}
