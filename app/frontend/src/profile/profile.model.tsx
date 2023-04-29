import { useState } from "react";
import { MatchHistoryItem, ProfileEntity } from "kingpong-lib";

/** Profile model type */
export interface ProfileModelType {
  user: string /** User ID of profile to load */;
  setUser: (user: string) => void;
  profile: ProfileEntity /** Profile to display */;
  setProfile: (profile: ProfileEntity) => void;
  matchHistory: MatchHistoryItem[] /** Match history to display */;
  setMatchHistory: (matchHistory: MatchHistoryItem[]) => void;
  friends: ProfileEntity[] /** Friends list to display */;
  setFriends: (friends: ProfileEntity[]) => void;
}

/** Profile model */
export const useProfileModel = (): ProfileModelType => {
  const [user, setUser] = useState<string>(null);
  const [profile, setProfile] = useState<ProfileEntity>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>(null);
  const [friends, setFriends] = useState<ProfileEntity[]>(null);

  return {
    user,
    setUser,
    profile,
    setProfile,
    matchHistory,
    setMatchHistory,
    friends,
    setFriends
  };
};
