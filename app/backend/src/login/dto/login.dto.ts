import { Logger } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

const logger = new Logger("LoginDto");

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

    logger.debug(`username: ${this.username}`);
  }
}
