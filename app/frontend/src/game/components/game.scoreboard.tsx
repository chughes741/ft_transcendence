import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useGameViewModelContext } from "../game.viewModel";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import { Icon } from "@mui/material";
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
    <Box
      sx={{ flexGrow: 0, flexDirection: "row", alignContent: "space-around" }}
    >
      <Box sx={{display: "flex", flexGrow: 1}}>
        <Typography>{scoreLeft}</Typography>
      </Box>
      <Icon sx={{display: "flex", flexGrow: 1}}>
        <SportsTennisIcon />
      </Icon>
      <Box sx={{display: "flex", flexGrow: 1}}>
        <Typography>{scoreRight}</Typography>
      </Box>
    </Box>
  );
}
