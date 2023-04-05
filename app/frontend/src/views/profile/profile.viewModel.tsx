/** Module Imports */
import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { socket } from "src/contexts/WebSocketContext";

/** Temporary data type import */
import {
  FetchMatchHistoryReply,
  FetchProfileReply,
  MatchHistoryItem,
  Profile
} from "kingpong-lib";

/**
 * Sends a fetch message to the backend to retrieve match history
 * @returns {Promise<MatchHistoryItem[]>}
 */
export function FetchMatchHistory(): Promise<MatchHistoryItem[]> {
  return new Promise((resolve) => {
    socket.emit(
      "fetchMatchHistory",
      "someuserID",
      (fetchMatchHistoryReply: FetchMatchHistoryReply) => {
        resolve(fetchMatchHistoryReply.matches);
      }
    );
  });
}

/**
 *
 */
export function FetchProfile(): Promise<Profile> {
  return new Promise((resolve) => {
    socket.emit(
      "fetchProfile",
      "someuserID",
      (fetchProfileReply: FetchProfileReply) => {
        resolve(fetchProfileReply.profile);
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
