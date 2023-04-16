import { UserStatus } from "@prisma/client";

export class UserEntity {
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
}

export class AuthEntity {
  token: string;
  user: UserEntity;
}
