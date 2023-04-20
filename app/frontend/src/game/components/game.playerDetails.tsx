import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { useGameViewModelContext } from "../game.viewModel";
import { useRootViewModelContext } from "src/root.context";
import { FaBox } from "react-icons/fa";

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
        <Box sx={{ display: "flex", alignContent: "space-around"}}>
          <Typography>{self.username}</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignContent: "space-around"}}>
          <Typography>{opponentUsername}</Typography>
        </Box>
      )}
    </>
  );
}
