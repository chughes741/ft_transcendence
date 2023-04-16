import { ToggleButton } from "@mui/material";
import { Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useGameViewModelContext } from "../game.viewModel";
import TripOriginIcon from '@mui/icons-material/TripOrigin';
/**
 * ReadyButton component
 * 
 * @param {string} side
 * @returns {JSX.Element}
 */
export default function ReadyButton() {
  const { playerReady, setPlayerReadyState } =
    useGameViewModelContext();

  return (
    <>
      <Box sx={{ ml: 2, mr: 2}}>
        <ToggleButton
          value="Ready"
          selected={playerReady}
          onChange={setPlayerReadyState}
          sx={{ color: !playerReady ? 'white' : 'success.main' }}
         >
          <CheckCircleIcon sx={{ color: !playerReady ? 'white' : 'success.main' }}/>
        </ToggleButton>
      </Box>
    </>
  );
}
