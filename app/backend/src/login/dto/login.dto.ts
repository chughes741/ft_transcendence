import { Logger } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  password?: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;

    Logger.log(`email: ${this.email}`);
  }
}
