/** MUI */
import {
  Avatar,
  MenuItem,
  ListItemText,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Badge,
  styled
} from "@mui/material";

/** Shared Library */
import { MatchHistoryItem, ProfileEntity, UserStatus } from "kingpong-lib";

/** View Model */
import { useProfileViewModelContext } from "src/profile/profile.viewModel";
import React from "react";

type StyledBadgeProps = {
  status: UserStatus;
};

const StyledBadge = styled(Badge)<StyledBadgeProps>(({ theme, status }) => ({
  "& .MuiBadge-badge": {
    backgroundColor:
      status === UserStatus.ONLINE
        ? "#44b700"
        : status === UserStatus.OFFLINE
        ? "#ff0000"
        : "#ffa500",
    color:
      status === UserStatus.ONLINE
        ? "#44b700"
        : status === UserStatus.OFFLINE
        ? "#ff0000"
        : "#ffa500",
    boxShadow: `0 0 0 4px ${theme.palette.background.paper}`
  }
}));

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
        <Paper>
          <Grid
            container
            sx={{ padding: "1rem", alignItems: "center" }}
          >
            <Grid
              item
              xs={4}
            >
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent=" "
                status={profile.status}
              >
                <Avatar
                  src={profile.avatar}
                  sx={{ width: "4rem", height: "4rem" }}
                ></Avatar>
              </StyledBadge>
            </Grid>
            <Grid
              container
              item
              xs={8}
            >
              <Grid
                item
                xs={12}
              >
                <Typography variant="h5">{profile.username}</Typography>
              </Grid>
              <Grid
                item
                xs={12}
              >
                <Typography>Joined: {profile.createdAt}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
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
          bgcolor:
            row.score_player1 > row.score_player2 ? "info.dark" : "error.dark",
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
          {row.game_type}
        </TableCell>
        <TableCell align="center">
          {row.player1}
          <br />
          {row.player2}
        </TableCell>
        <TableCell align="center">
          {row.score_player1}-{row.score_player2}
        </TableCell>
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
  const { setUser } = useProfileViewModelContext();
  const handleClick = () => {
    console.log("Clicked on friend: " + friend.username);
    setUser(friend.username);
  };

  return (
    <>
      <MenuItem
        onClick={() => handleClick()}
        sx={{ padding: "0.5rem" }}
      >
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          status={friend.status}
        >
          <Avatar
            alt={friend.username}
            src={friend.avatar}
            sx={{ width: "2rem", height: "2rem" }}
          />
        </StyledBadge>
        <ListItemText
          sx={{ ml: "1rem" }}
          primary={friend.username}
        />
      </MenuItem>
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
