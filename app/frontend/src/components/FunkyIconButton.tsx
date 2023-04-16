import { Box, SxProps } from "@mui/system";
import "./FunkyIconButton.tsx.css";
import { Theme } from "@mui/material";

type FunkyIconButtonProps = {
  content: string;
  onClick?: () => void;
  icon: React.ReactNode;
  width?: string;
  sx?: SxProps<Theme>;
};

export default function FunkyIconButton({
  content,
  onClick,
  icon,
  width = "auto",
  sx
}: FunkyIconButtonProps) {
  return (
    <Box
      className="funky-icon-button"
      onClick={onClick}
      sx={{ ...sx, width }}
    >
      <div className="funky-icon-button-bg"></div>
      <div className="funky-icon-button-content">
        {icon}
        <span>{content}</span>
      </div>
    </Box>
  );
}
