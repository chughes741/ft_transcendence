import { Box } from "@mui/system";
import "./ButtonFunky.tsx.css";

type ButtonProps = {
  content: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  width: string;
};

export default function ButtonFunky({
  content,
  onClick,
  icon,
  width = "auto"
}: ButtonProps) {
  return (
    <div
      className="button-funky"
      onClick={onClick}
      style={{ width: width }}
    >
      <div className="button-funky-bg"></div>
      <span className="button-funky-content">
        {content}
        {icon && (
          <Box
            component="span"
            sx={{ marginRight: 1 }}
          >
            {icon}
          </Box>
        )}
      </span>
    </div>
  );
}
