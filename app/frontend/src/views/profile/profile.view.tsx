/** MUI */
import {
  Avatar,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

/** Shared Library */
import { MatchHistoryItem, UserStatus } from "kingpong-lib";

/** View Model */
import {
  Item,
  useProfileViewModelContext
} from "src/views/profile/profile.viewModel";

/**
 * Creates profile page header
 *
 * @returns {JSX.Element | null}
 */
function ProfileHeader(): JSX.Element | null {
  const { profile } = useProfileViewModelContext();

  return (
    <>
      {profile && (
        <Item id="profile-header">
          <Avatar src={profile.avatar}></Avatar>
          <Typography
            variant="h5"
            color="text.primary"
            gutterBottom
          >
            {profile.username}
          </Typography>
          <Typography>
            Status:{" "}
            {profile.status === UserStatus.ONLINE ? "Online" : "Offline"}
          </Typography>
        </Item>
      )}
    </>
  );
}

/**
 * Creates a TableRow with a MatchHistoryItem
 *
 * @param {MatchHistoryItem} row
 * @returns {JSX.Element | null}
 */
function MatchHistoryRow(row: MatchHistoryItem): JSX.Element | null {
  return (
    <>
      <TableRow
        id="profile-match-history-row"
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
 *
 * @returns {JSX.Element | null}
 */
function MatchHistory(): JSX.Element | null {
  const { matchHistory } = useProfileViewModelContext();

  /** Data column names */
  const cell_names = ["Match type", "Players", "Results", "Date"];

  return (
    <>
      <TableContainer
        id="profile-match-history"
        component={Paper}
      >
        <Table>
          <TableHead>
            <TableRow>
              {cell_names.map((cell) => (
                <TableCell align="center">{cell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          {matchHistory && matchHistory.length > 0 && (
            <TableBody>
              {matchHistory.map((row) => MatchHistoryRow(row))}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </>
  );
}

/**
 * Loads profile page
 *
 * @returns {JSX.Element | null}
 */
export default function ProfileView(): JSX.Element | null {
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
