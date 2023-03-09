import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ChatMemberRank, ChatMemberStatus, ChatRoomStatus, UserStatus } from "@prisma/client";


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
