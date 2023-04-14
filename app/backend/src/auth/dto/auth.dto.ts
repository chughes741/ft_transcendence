import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UserEntity {
  username: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class AuthRequest {
  username: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class AuthEntity {
  token: string;
  user: UserEntity;
}
