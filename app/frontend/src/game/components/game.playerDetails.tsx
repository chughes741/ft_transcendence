import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { useGameViewModelContext } from "../game.viewModel";
import { useRootViewModelContext } from "src/root.context";

/**
 * PlayerDetail component
 *
 * @param {string} side
 * @returns {JSX.Element}
 */
export default function PlayerDetail({ side }) {
  const { playerSide, opponentUsername } = useGameViewModelContext();
  const { self } = useRootViewModelContext();
  return (
    <>
      {side === playerSide ? (
        <Box>
          <Typography>{self.username}</Typography>
        </Box>
      ) : (
        <Box>
          <Typography>{opponentUsername}</Typography>
        </Box>
      )}
    </>
  );
}
