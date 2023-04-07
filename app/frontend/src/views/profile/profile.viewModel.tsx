/** Module Imports */
import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { socket } from "src/contexts/WebSocketContext";

/** Temporary data type import */
import {
  MatchHistoryEntity,
  MatchHistoryItem,
  ProfileEntity,
  ProfileEvents
} from "kingpong-lib";

/**
 * Sends a getMatchHistory request to the server
 *
 * @param {string} id
 * @returns {Promise<MatchHistoryItem[]>}
 */
export function GetMatchHistory(id: string): Promise<MatchHistoryItem[]> {
  return new Promise((resolve) => {
    socket.emit(
      ProfileEvents.GetMatchHistory,
      id,
      (matchHistoryEntity: MatchHistoryEntity) => {
        resolve(matchHistoryEntity.matches);
      }
    );
  });
}

/**
 * Sends a getProfile request to the server
 *
 * @param {string} id
 * @returns {Promise<ProfileEntity>}
 */
export function GetProfile(id: string): Promise<ProfileEntity> {
  return new Promise((resolve) => {
    socket.emit(
      ProfileEvents.GetProfile,
      id,
      (profileEntity: ProfileEntity) => {
        resolve(profileEntity);
      }
    );
  });
}

/** Styling for Profile header */
export const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));
