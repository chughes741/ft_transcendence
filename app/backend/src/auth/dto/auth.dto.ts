import { ApiProperty } from "@nestjs/swagger";
import { UserStatus } from "@prisma/client";
import { IsNotEmpty, IsString } from "class-validator";

export class UserEntity {
  id? : string;
  username: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status: UserStatus;
}

export class AuthRequest {
  username: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  token : string;
}

export class AuthEntity {
  token: string;
  user: UserEntity;
}
