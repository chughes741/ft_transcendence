import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Login username"
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Login password"
  })
  password: string;
}
