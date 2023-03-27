/** Module Imports */
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

/**
 * Creates test object with params
 * @param match_type 
 * @param players 
 * @param results 
 * @param date 
 * @param winner 
 */
function createData(
  match_type: string,
  players: string,
  results: string,
  date: string,
  winner: boolean
) {
  return { match_type, players, results, date, winner };
}

const rows = [
  createData("Ranked", "Me, you", "2-0", "32-01-2023", true),
  createData("Ranked", "Me, you", "69-5", "15-03-1066", true),
  createData("Unranked", "You, me", "42-0", "31-12-1999", false),
  createData("Ranked", "Me, myself, and I", "42-43", "25-12-0001", false),
  createData("Unranked", "Just you", "4-2", "25-12-0001", true)
];

/**
 * Creates a TableRow
 * @param row - Data object to enter into row
 */
function MatchRow(row) {
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
export function MatchHistory() {
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
          <TableBody>{rows.map((row) => MatchRow(row))}</TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
