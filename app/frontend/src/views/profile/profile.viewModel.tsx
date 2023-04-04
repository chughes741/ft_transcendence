/** Module Imports */
import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

/** Temporary data type import */
import { MatchHistoryItem } from "src/views/profile/profile.model";

/** Mock data */
const matchHistory: MatchHistoryItem[] = [
  {
    match_type: "Solo",
    players: "John",
    results: "Victory",
    date: "2022-03-15",
    winner: true
  },
  {
    match_type: "Duo",
    players: "John, Jane",
    results: "Defeat",
    date: "2022-03-16",
    winner: false
  },
  {
    match_type: "Squad",
    players: "John, Jane, Bob, Alice",
    results: "Victory",
    date: "2022-03-17",
    winner: true
  }
];

/** @todo this function needs to make a fetch request to backend */
export function FetchMatchHistory(): MatchHistoryItem[] {
  return matchHistory;
}

export const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));
