import { ToggleButton } from "@mui/material";
import { Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useGameViewModelContext } from "../game.viewModel";

/**
 * ReadyButton component
 * 
 * @param {string} side
 * @returns {JSX.Element}
 */
export default function ReadyButton({side}) {
  const { playerReady, setPlayerReadyState, lobby } =
    useGameViewModelContext();

  return (
    <>
      {side === lobby.player_side ? (
        <Box sx={{ ml: 2, mr: 2}}>
          <ToggleButton
            value="check"
            selected={lobby.player_ready}
            onChange={() => setPlayerReadyState(!playerReady)}
          >
            <CheckCircleIcon />
          </ToggleButton>
        </Box>
      ) : (
        <Box sx={{ ml: 2, mr: 2}}>
          <ToggleButton
            value="check"
            selected={lobby.opponent_ready}
          >
            <CheckCircleIcon />
          </ToggleButton>
        </Box>
      )}
    </>
  );
}
