import React from "react";
import { Box } from "@mui/system";
import "./GameLoader.tsx.css";

interface Props {
  setInQueue: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GameLoader(props: Props) {
  const { setInQueue } = props;

  // Set inQueue to false when the component unmounts
  React.useEffect(() => {
    return () => {
      setInQueue(false);
    };
  }, [setInQueue]);

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
          <Box
            className="leave-queue-button"
            onClick={() => setInQueue(false)}
          >
            Leave Queue
          </Box>
        </Box>
      </Box>
    </>
  );
}
