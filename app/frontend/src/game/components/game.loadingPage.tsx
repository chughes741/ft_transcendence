import { Box } from "@mui/system";
import "./game.loadingPage.tsx.css";
import { useGameViewModelContext } from "../game.viewModel";

/**
 * Component that renders the loading page for the game
 *
 * @returns {JSX.Element}
 */
export default function LoadingPage() {
  const { opponentUsername } = useGameViewModelContext();
  console.log(opponentUsername);
  return (
    <>
      <Box className="body-page">
        <Box className="body-text">
          <h2
            data-text={
              opponentUsername.length > 0
                ? `Waiting for ${opponentUsername}...`
                : "Looking for a match..."
            }
          >
            Looking for a match...
          </h2>
        </Box>
        <Box className="body-loader">
          <Box className="loader">
            <Box className="paddle" />
            <Box className="ball" />
            <Box className="ball bottom" />
            <Box className="shadow" />
            <Box className="table" />
          </Box>
        </Box>
      </Box>
    </>
  );
}
