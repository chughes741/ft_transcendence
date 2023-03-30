import * as React from "react";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import MailIcon from "@mui/icons-material/Mail";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

export default function NotificationBadge() {
    const [count, setCount] = React.useState(1);
  const [invisible, setInvisible] = React.useState(false);

  const handleBadgeVisibility = () => {
    setInvisible(!invisible);
  };


//   setCount(count + 1);

  return (
    <Box
    >
        {/* <Badge color="secondary" badgeContent={count}> */}
        <Badge color="secondary" badgeContent={5}>
          <MailIcon />
        </Badge>
    </Box>
  );
}