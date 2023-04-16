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
      className="button-funky"
      onClick={onClick}
      sx={{ ...sx, width }}
    >
      <div className="button-funky-bg"></div>
      <div className="button-funky-content">
        {icon}
        <span>{content}</span>
      </div>
    </Box>
  );
}
