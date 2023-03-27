import { Logger } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  password?: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;

    Logger.log(`username: ${this.username}`);
  }
}
