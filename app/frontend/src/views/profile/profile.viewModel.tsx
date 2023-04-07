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
 * Sends a fetch message to the backend to retrieve match history
 * @returns {Promise<MatchHistoryItem[]>}
 */
export function GetMatchHistory(): Promise<MatchHistoryItem[]> {
  return new Promise((resolve) => {
    socket.emit(
      ProfileEvents.GetMatchHistory,
      "someuserID",
      (matchHistoryEntity: MatchHistoryEntity) => {
        resolve(matchHistoryEntity.matches);
      }
    );
  });
}

/**
 *
 */
export function GetProfile(): Promise<ProfileEntity> {
  return new Promise((resolve) => {
    socket.emit(
      ProfileEvents.GetProfile,
      "someuserID",
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
