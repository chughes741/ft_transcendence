import Box from "@mui/material/Box";
import React from "react";
import "./error.tsx.css";

export default function Fallback({ resetErrorBoundary }) {
  function resetError() {
    resetErrorBoundary();
  }

  return (
    <Box className="error-page">
      <Box className="error-top-bar">
        <Box className="error-title">
          <h1 data-text="error: something broke">
            <span>error :something broke</span>
          </h1>
        </Box>
        <Box>
          <h1 className="deux" data-text="Please, try again">
            <span> Please, try again</span>
          </h1>
        </Box>
        <button onClick={resetError}>Reset</button>
      </Box>
    </Box>
  );
}
