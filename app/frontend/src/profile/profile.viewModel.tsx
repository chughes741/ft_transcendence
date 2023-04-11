import React, { createContext, useContext, useEffect } from "react";

/** Module Imports */
import { socket } from "src/contexts/WebSocket.context";

/** Temporary data type import */
import { MatchHistoryItem, ProfileEntity, ProfileEvents } from "kingpong-lib";
import { ProfileModelType, useProfileModel } from "./profile.model";

/**
 * ProfileViewModelType
 *
 * @interface ProfileViewModelType
 */
export interface ProfileViewModelType extends ProfileModelType {
  getMatchHistory: () => Promise<void>;
  getProfile: () => Promise<void>;
  getFriends: () => Promise<void>;
  addFriend: (username: string, friend: string) => Promise<void>;
}

/**
 * ProfileViewModelContext
 *
 * @type {React.Context<ProfileViewModelType | null>}
 */
export const ProfileViewModelContext: React.Context<ProfileViewModelType | null> =
  createContext<ProfileViewModelType | null>(null);

/**
 *  Provides the ProfileViewModelContext to the ProfileView
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
   */
  const getMatchHistory = async (): Promise<void> => {
    console.log("getMatchHistory", user);
    if (user === null) {
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
   * Sends a getProfile request to the server
   */
  const getProfile = async (): Promise<void> => {
    if (user === null) {
      return;
    }
    console.log("getProfile", user);
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
   */
  const getFriends = async (): Promise<void> => {
    if (user === null) {
      return;
    }
    console.log("getFriendsRequest", user);
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
   * @param {string} username
   * @param {string} friend
   * @returns {Promise<void>}
   */
  const addFriend = async (username: string, friend: string): Promise<void> => {
    if (username === null || friend === null) {
      return;
    }
    console.log("addFriend", username, friend);
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
        addFriend
      }}
    >
      {children}
    </ProfileViewModelContext.Provider>
  );
};

/**
 *  Returns the ProfileViewModelContext
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
