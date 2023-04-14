import { ToggleButton } from "@mui/material";
import { Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useGameViewModelContext } from "../game.viewModel";

export default function readyButton(side: string) {
  const { playerReady, setPlayerReadyState, lobby, setLobby } =
    useGameViewModelContext();

  return (
    <>
      {side === lobby.player_side ? (
        <Box>
          <ToggleButton
            value="check"
            selected={lobby.player_ready}
            onChange={() => setPlayerReadyState(!playerReady)}
          >
            <CheckCircleIcon />
          </ToggleButton>
        </Box>
      ) : (
        <Box>
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
