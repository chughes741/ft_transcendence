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
  TableRow,
  Grid
} from "@mui/material";

/** Shared Library */
import { MatchHistoryItem, ProfileEntity, UserStatus } from "kingpong-lib";

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
 * Creates a TableRow with a ProfileEntity
 *
 * @param {ProfileEntity} friend
 * @returns {JSX.Element | null}
 */
function FriendsListRow(friend: ProfileEntity): JSX.Element | null {
  return (
    <>
      <TableRow id="profile-friends-list-row">
        <TableCell align="center">{friend.username}</TableCell>
      </TableRow>
    </>
  );
}

/**
 * Loads friends list component
 *
 * @returns {JSX.Element | null}
 */
function FriendsList(): JSX.Element | null {
  const { friends } = useProfileViewModelContext();

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Friends</TableCell>
            </TableRow>
          </TableHead>
          {friends && friends.length > 0 && (
            <TableBody>
              {friends.map((friend) => FriendsListRow(friend))}
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
      <Grid
        container
        rowSpacing={2}
        columnSpacing={1}
        width="80%"
      >
        <Grid
          item
          xs={12}
        >
          <ProfileHeader />
        </Grid>
        <Grid
          item
          xs={8}
        >
          <MatchHistory />
        </Grid>
        <Grid
          item
          xs={4}
        >
          <FriendsList />
        </Grid>
      </Grid>
    </>
  );
}
