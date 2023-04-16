import React, { useState } from "react";
import { IconButton as MuiIconButton } from "@mui/material";
import { Box, SxProps, Theme } from "@mui/system";
import { CSSProperties } from "@mui/styles";
import "./DynamicIconButton.tsx.css";

type DynamicIconButtonProps = {
  text: string;
  icon: React.ReactNode;
  onClick?: () => void;
  width?: string;
  sx?: SxProps<Theme>;
};

export default function DynamicIconButton({
  text,
  icon,
  onClick,
  width = "auto",
  sx
}: DynamicIconButtonProps) {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const transitionStyles: CSSProperties = {
    transition: "width 0.3s ease-out, opacity 0.3s ease-out",
    overflow: "hidden",
    whiteSpace: "nowrap",
    width: hovered ? "auto" : 0,
    opacity: hovered ? 1 : 0
  };

  const iconStyle = {
    fontSize: "2rem" // Adjust the size accordingly
  };

  return (
    <Box
      className="dynamic-icon-button"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      // style={{ width: width }}
      sx={{ ...sx, width }}
    >
      <div className="dynamic-icon-button-bg"></div>
      <div className="dynamic-icon-button-content">
        <MuiIconButton
          size="large"
          disableRipple
          className="icon-button"
          sx={iconStyle}
        >
          {icon}
        </MuiIconButton>
        {hovered && <span style={transitionStyles}>{text}</span>}
      </div>
    </Box>
  );
}
