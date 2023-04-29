import React, { createContext, useContext, useEffect } from "react";

/** Module Imports */
import { socket } from "src/contexts/WebSocket.context";

/** Temporary data type import */
import { MatchHistoryItem, ProfileEntity, ProfileEvents } from "kingpong-lib";
import { ProfileModelType, useProfileModel } from "./profile.model";

/** ProfileViewModelType */
export interface ProfileViewModelType extends ProfileModelType {
  getMatchHistory: () => Promise<void>;
  getProfile: () => Promise<void>;
  getFriends: () => Promise<void>;
  addFriend: (username: string, friend: string) => Promise<void>;
  getWinPercentage: () => number;
  getLossPercentage: () => number;
}

/** ProfileViewModelContext */
export const ProfileViewModelContext: React.Context<ProfileViewModelType | null> =
  createContext<ProfileViewModelType | null>(null);

/**
 * Provides the ProfileViewModelContext to the ProfileView
 *
 * @returns {JSX.Element}
 */
export const ProfileViewModelProvider = ({ children }) => {
  const {
    user,
    setUser,
    profile,
    setProfile,
    matchHistory,
    setMatchHistory,
    friends,
    setFriends
  } = useProfileModel();

  /**
   * Sends a getMatchHistory request to the server
   *
   * @todo Change MatchHistoryItem to MatchHistoryEntity once kingpong-lib is updated
   *
   * @returns {Promise<void>}
   */
  const getMatchHistory = async (): Promise<void> => {
    console.debug("getMatchHistory", user);
    if (!user || user === "") {
      console.warn("No user found");
      return;
    }

    socket.emit(
      ProfileEvents.GetMatchHistory,
      { username: user, number_of_items: 50 },
      (matchHistoryItems: MatchHistoryItem[]) => {
        setMatchHistory(matchHistoryItems);
      }
    );
  };

  /**
   * Generates a win percentage based on the match history
   *
   * @returns {number} - Win percentage
   */
  const getWinPercentage = () => {
    if (!matchHistory) return;

    let numWins = 0;
    for (let i = 0; i < matchHistory.length; i++) {
      if (matchHistory[i].score_player1 > matchHistory[i].score_player2)
        numWins++;
    }

    let percent: number = (numWins / matchHistory.length) * 100;
    if (isNaN(percent)) percent = 0;

    return percent;
  };

  /**
   * Generates a loss percentage based on the match history
   *
   * @returns {number} - Loss percentage
   */
  const getLossPercentage = () => {
    if (!matchHistory) return;

    let numLosses = 0;
    for (let i = 0; i < matchHistory.length; i++) {
      if (matchHistory[i].score_player1 < matchHistory[i].score_player2)
        numLosses++;
    }

    let percent: number = (numLosses / matchHistory.length) * 100;
    if (isNaN(percent)) percent = 0;

    return percent;
  };

  /**
   * Sends a getProfile request to the server
   *
   * @returns {Promise<void>}
   */
  const getProfile = async (): Promise<void> => {
    if (user === null) return;

    console.debug("getProfile", user);
    socket.emit(
      ProfileEvents.GetProfile,
      { username: user },
      (profileEntity: ProfileEntity) => {
        setProfile(profileEntity);
      }
    );
  };

  /**
   * Sends a getFriends request to the server
   *
   * @todo Change message name to enum once kingpong-lib is updated
   *
   * @returns {Promise<void>}
   */
  const getFriends = async (): Promise<void> => {
    if (user === null) return;

    console.debug("getFriendsRequest", user);
    socket.emit(
      ProfileEvents.GetFriends,
      { username: user },
      (friends: ProfileEntity[]) => {
        setFriends(friends);
      }
    );
  };

  /**
   * Adds a friend to friends list
   *
   * @param {string} username - Username of the user
   * @param {string} friend - Username of the friend
   * @returns {Promise<void>}
   */
  const addFriend = async (username: string, friend: string): Promise<void> => {
    if (username === null || friend === null) return;

    console.debug("addFriend", username, friend);
    socket.emit(ProfileEvents.AddFriend, {
      username: username,
      friend: friend
    });
  };

  /** Update MatchHistory and Profile when user changes */
  useEffect(() => {
    getMatchHistory().then();
    getProfile().then();
    getFriends().then();
  }, [user]);

  return (
    <ProfileViewModelContext.Provider
      value={{
        user,
        setUser,
        profile,
        setProfile,
        matchHistory,
        setMatchHistory,
        friends,
        setFriends,
        getMatchHistory,
        getProfile,
        getFriends,
        addFriend,
        getWinPercentage,
        getLossPercentage
      }}
    >
      {children}
    </ProfileViewModelContext.Provider>
  );
};

/**
 * Returns the ProfileViewModelContext
 *
 * @returns {ProfileViewModelType}
 */
export const useProfileViewModelContext = (): ProfileViewModelType => {
  const context = useContext(ProfileViewModelContext);

  if (context === undefined) {
    throw new Error(
      "useProfileViewModelContext must be used within a ProfileViewModelProvider"
    );
  }

  return context;
};
