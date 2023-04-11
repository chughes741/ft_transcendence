import Box from "@mui/material/Box";
import React, { ReactElement } from "react";
import "./error.tsx.css";
import DynamicIconButton from "../DynamicIconButton";
import AlbumIcon from "@mui/icons-material/Album";

interface FallbackProps {
  resetErrorBoundary: () => void;
  error: Error;
}

export default function Fallback({
  resetErrorBoundary,
  error
}: FallbackProps): ReactElement {
  function resetError() {
    console.log(error);
    resetErrorBoundary();
  }

  return (
    <Box className="error-page">
      <Box className="error-title">
        <h1 data-text="error: something broke">
          <span>error :something broke</span>
        </h1>
      </Box>
      <Box>
        <h1
          className="second-line"
          data-text="Please, try again"
        >
          <span> Please, try again</span>
        </h1>
      </Box>
      <Box className="button">
        <DynamicIconButton
          text={"Reset"}
          icon={<AlbumIcon />}
          onClick={resetError}
        />
      </Box>
    </Box>
  );
}
