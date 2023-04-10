import { useState } from "react";
import { MatchHistoryItem, ProfileEntity } from "kingpong-lib";

export interface ProfileModelType {
  /** User ID of profile to load */
  user: string;
  setUser: (user: string) => void;
  /** Profile to display */
  profile: ProfileEntity;
  setProfile: (profile: ProfileEntity) => void;
  /** Match history to display */
  matchHistory: MatchHistoryItem[];
  setMatchHistory: (matchHistory: MatchHistoryItem[]) => void;
  /** Friends list to display */
  friends: ProfileEntity[];
  setFriends: (friends: ProfileEntity[]) => void;
}

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
