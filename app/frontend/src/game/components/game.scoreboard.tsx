import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { GameContext } from "src/game/game.context";

/**
 * ScoreBoard component
 * 
 * @param {string} side
 * @returns {JSX.Element}
 */
export default function ScoreBoard() {
  const { scoreLeft, setScoreLeft } = useContext(GameContext);
  const { scoreRight, setScoreRight } = useContext(GameContext);

  return (
    <Box sx={{ flexGrow: 0, alignItems: "space-around" }}>
      <Typography>{scoreLeft}</Typography>
      <Typography>{scoreRight}</Typography>
    </Box>
  );
}
