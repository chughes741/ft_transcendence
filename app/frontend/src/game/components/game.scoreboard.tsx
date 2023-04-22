import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useGameViewModelContext } from "../game.viewModel";
import { Divider, Icon } from "@mui/material";
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
    <Box sx={{ flexGrow: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignContent: "space-around",
          alignItems: "center",
          border: 1,
          borderColor: "primary.main",
          borderRadius: 1
        }}
      >
        <Box sx={{ display: "flex", flexGrow: 1, ml: 2 }}>
          <Typography>{scoreLeft}</Typography>
        </Box>
        <Box sx={{ display: "flex", flexGrow: 1, ml: 2 }}>
          <Divider
            orientation="vertical"
            flexItem
          >
            <Typography color={"orange"}>SCORE</Typography>
          </Divider>
        </Box>
        <Box sx={{ display: "flex", flexGrow: 1, ml: 2, mr: 2 }}>
          <Typography>{scoreRight}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
