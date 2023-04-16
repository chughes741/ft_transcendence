import { Box } from "@mui/system";
import "./game.loadingPage.tsx.css";

/**
 * Component that renders the loading page for the game
 *
 * @returns {JSX.Element}
 */
export default function LoadingPage() {
  return (
    <>
      <Box className="body-page">
        <Box className="body-text">
          <h2 data-text="Looking for a match...">Looking for a match...</h2>
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
        <Box className="leave-queue-container">
          <Box className="leave-queue-button">
            Leave queue
          </Box>

        </Box>
      </Box>
    </>
  );
}
