import React from "react";
import { Box } from "@mui/system";
import "./GameLoader.tsx.css";

export default function GameLoader() {
  return (
    <>
      <Box className="body-page">
        <Box className="loader">
          <Box className="paddle" />
          <Box className="ball" />
          <Box className="ball bottom" />
        </Box>
      </Box>
    </>
  );
}
