//This will return a name and ready status for a single player
import * as React from "react";
import { Avatar, IconButton, ToggleButton, Typography, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ThemeProvider } from "@mui/material";
//If the player is the current user, it will have a toggleable button for ready status
//If the player is the opposing user, it will have a badge that shows opponents ready status

//Need to know which side each player is on, so both ready buttons can be in the middle

export default function GameActionBar() {
  const [selected, setSelected] = React.useState(false);
  return (
    <Box sx={{ backgroundColor: "grey",  display: "flex", flexDirection: "row",  alignItems: "center"}}>
        {/* Avatar component */}
      <Box>
        <Avatar></Avatar>
      </Box>

      {/* Scoreboard Component */}
      <Box sx={{ ml: 1 }}>
        <Typography>Joe Blow</Typography>
      </Box>

      {/* Readybutton component */}
      <Box sx={{ml: 2 }}>
        <ToggleButton
          value="check"
          selected={selected}
          onChange={() => {
            setSelected(!selected);
          }}
        >
          <CheckCircleIcon />
        </ToggleButton>
         {/* Score */}



         
         <Box sx={{ flexGrow: 0, alignItems: "space-around" }}>
          <Typography>Score: 2 | 0</Typography>
        </Box>
      </Box>
    </Box>
  );
}
