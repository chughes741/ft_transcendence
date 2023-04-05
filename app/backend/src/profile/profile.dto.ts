export class FetchProfileEvent {
  id: string;
}

/** @todo move to kingpong-lib */
export enum UserStatus {
  ONLINE,
  OFFLINE,
  AWAY
}

/** @todo move to kingpong-lib */
export class Profile {
  username: string;
  avatar: string;
  status: UserStatus;
  createdAt: string;
}

/** @todo move to kingpong-lib */
export class FetchProfileReply {
  profile: Profile;
}
