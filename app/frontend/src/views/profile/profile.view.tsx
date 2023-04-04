/** Module Imports */
import {
  Avatar,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";

/** Component Imports */
import "src/views/profile/profile.view.tsx.css";

/** Mock data import */
import { Item, FetchMatchHistory } from "src/views/profile/profile.viewModel";
import { MatchHistoryItem } from "./profile.model";
import { useEffect, useState } from "react";

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
 * Creates a TableRow with MatchHistoryItem
 * @param {MatchHistoryItem} row
 */
function MatchHistoryRow(row: MatchHistoryItem) {
  return (
    <>
      <TableRow
        sx={{
          bgcolor: row.winner === true ? "info.light" : "error.light",
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

  useEffect(() => {
    async function fetchMatches() {
      const history = await FetchMatchHistory();
      console.log(history);
      setMatches(history);
    }
    fetchMatches();
  }, []);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Match Type</TableCell>
              <TableCell align="center">Players</TableCell>
              <TableCell align="center">Results</TableCell>
              <TableCell align="center">Date</TableCell>
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
        className="profile-stack"
        spacing={2}
      >
        <ProfileHeader />
        <MatchHistory />
      </Stack>
    </>
  );
}
