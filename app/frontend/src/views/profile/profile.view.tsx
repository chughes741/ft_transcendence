import { useEffect, useState } from "react";

/** Module Imports */
import { Avatar, Paper, Stack } from "@mui/material";
import { deepOrange } from "@mui/material/colors";

/** Table from MUI */
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

/** Mock data import */
import { Item, FetchMatchHistory } from "src/views/profile/profile.viewModel";
import { MatchHistoryItem } from "./profile.model";

/**
 * Creates profile page header
 */
export function ProfileHeader() {
  return (
    <>
      <Item>
        <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>
      </Item>
    </>
  );
}

/**
 * Creates a TableRow with a MatchHistoryItem
 * @param {MatchHistoryItem} row
 */
function MatchHistoryRow(row: MatchHistoryItem) {
  return (
    <>
      <TableRow
        sx={{
          bgcolor: row.winner === true ? "info.dark" : "error.dark",
          "&:hover": {
            opacity: [0.9, 0.8, 0.7]
          }
        }}
      >
        <TableCell
          align="center"
          component="th"
          scope="row"
        >
          {row.match_type}
        </TableCell>
        <TableCell align="center">{row.players}</TableCell>
        <TableCell align="center">{row.results}</TableCell>
        <TableCell align="center">{row.date}</TableCell>
      </TableRow>
    </>
  );
}

/**
 * Loads match history component
 */
function MatchHistory() {
  const [matches, setMatches] = useState<MatchHistoryItem[]>([]);

  /** Fetch players match history from server */
  useEffect(() => {
    async function fetchMatches() {
      const history = await FetchMatchHistory();
      setMatches(history);
    }
    fetchMatches();
  }, []);

  /** Data column names */
  const cell_names = ["Match type", "Players", "Results", "Date"];

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {cell_names.map((cell) => (
                <TableCell align="center">{cell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{matches.map((row) => MatchHistoryRow(row))}</TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

/**
 * Loads profile page
 */
export default function ProfileView() {
  return (
    <>
      <Stack
        id="profile-stack"
        width={"80%"}
        spacing={2}
      >
        <ProfileHeader />
        <MatchHistory />
      </Stack>
    </>
  );
}
