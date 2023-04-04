/** Module Imports */
import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { socket } from "src/contexts/WebSocketContext";

/** Temporary data type import */
import { MatchHistoryItem } from "src/views/profile/profile.model";

/**
 *
 * @returns {Promise<MatchHistoryItem[]>}
 */
export function FetchMatchHistory(): Promise<MatchHistoryItem[]> {
  return new Promise((resolve) => {
    socket.emit("fetchMatchHistory", "someuserID", (matchHistoryEntity) => {
      resolve(matchHistoryEntity.matches);
    });
  });
}

export const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));
