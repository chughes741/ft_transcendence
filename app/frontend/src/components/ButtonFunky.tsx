import { Box, SxProps } from "@mui/system";
import { IconButton as MuiIconButton } from "@mui/material";
import "./ButtonFunky.tsx.css";
import "./DynamicIconButton.tsx.css";
import { Theme } from "@mui/material";

type ButtonProps = {
  content: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  width: string;
  sx?: SxProps<Theme>;
};

export default function ButtonFunky({
  content,
  onClick,
  icon,
  width = "auto",
  sx
}: ButtonProps) {
  const iconStyle = {
    fontSize: "1.8rem" // Adjust the size accordingly
  };

  return (
    <Box
      className="button-funky"
      onClick={onClick}
      // style={{ width: width }}
      sx={{ ...sx, width }}
    >
      <div className="button-funky-bg"></div>
      <div className="button-funky-content">
        <MuiIconButton
          size="large"
          disableRipple
          className="icon-button"
          sx={iconStyle}
        >
          {icon}
        </MuiIconButton>
        <span>{content}</span>
      </div>
    </Box>
  );
}
