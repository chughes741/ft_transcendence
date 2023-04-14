import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { GameContext } from "../game.context";

export default function playerDetail(side: string) {
  const { lobby, setLobby } = useContext(GameContext);

  return (
    <>
      {side === lobby.player_side ? (
        <Box>
          <Box>
            <Avatar
              alt={lobby.player_name}
              src={lobby.player_avatar}
            />
          </Box>

          <Box>
            <Typography>{lobby.player_name}</Typography>
          </Box>
        </Box>
      ) : (
        <Box>
          <Box>
            <Avatar
              alt={lobby.opponent_name}
              src={lobby.opponent_avatar}
            />
          </Box>

          <Box>
            <Typography>{lobby.opponent_name}</Typography>
          </Box>
        </Box>
      )}
    </>
  );
}
