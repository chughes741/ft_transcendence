import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { GameContext } from "../game.context";

/**
 * PlayerDetail component
 * 
 * @param {string} side
 * @returns {JSX.Element}
 */
export default function PlayerDetail({ side }) {
  const { lobby } = useContext(GameContext);

  return (
    <>
      {side === lobby.player_side ? (
        <Box>
          <Box>
            <Avatar
              alt={lobby.player_username}
              src={lobby.player_avatar}
            />
          </Box>

          <Box>
            <Typography>{lobby.player_username}</Typography>
          </Box>
        </Box>
      ) : (
        <Box>
          <Box>
            <Avatar
              alt={lobby.opponent_username}
              src={lobby.opponent_avatar}
            />
          </Box>

          <Box>
            <Typography>{lobby.opponent_username}</Typography>
          </Box>
        </Box>
      )}
    </>
  );
}
