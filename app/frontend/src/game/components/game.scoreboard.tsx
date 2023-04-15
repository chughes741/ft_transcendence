import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useGameViewModelContext } from "../game.viewModel";

/**
 * ScoreBoard component
 *
 * @param {string} side
 * @returns {JSX.Element}
 */
export default function ScoreBoard() {
  const { scoreLeft, setScoreLeft, scoreRight, setScoreRight } =
    useGameViewModelContext();

  return (
    <Box sx={{ flexGrow: 0, alignItems: "space-around" }}>
      <Typography>{scoreLeft}</Typography>
      <Typography>{scoreRight}</Typography>
    </Box>
  );
}
