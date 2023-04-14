import React from "react";
import { Box } from "@mui/system";
import "./GameLoader.tsx.css";
import { useRootViewModelContext } from "../../root.context";
import { PageState } from "../../root.model";

export default function GameLoader() {
  const { setPageState } = useRootViewModelContext();
  return (
    <>
      <Box className="body-page">
        <Box className="body-text">
          <h2 data-text="Looking for a match...">
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
