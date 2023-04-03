import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import { LogoSvg } from "./logoComponent";
import { ButtonUnstyled } from "@mui/base";
import { Button, Tooltip } from "@mui/material";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";

const TopBarHeight = 85;

const settings = ["Profile", "Settings", "Logout"];

//Set css flexbox options for the toolbar component to create proper object positioning for child elements
const toolbarStyle = {
  display: "flex",
  justifyContent: "space-between"
};

function TopBar({setPageState}) {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const onClickProfile = ()  => {
    setPageState(3);
    handleCloseUserMenu();
  }

  return (
    <AppBar 
      position="static"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, flexGrow: 0 }}
      >
        <Toolbar
          disableGutters
          style={toolbarStyle}
        >
          {/* Logo wrapped in button to return to home */}

          <Box sx={{ marginTop: 2, flexGrow: 1 }}>
            <ButtonUnstyled
                onClick={() => setPageState(0)}
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer"
                }}
            >
              <LogoSvg />
            </ButtonUnstyled>
          </Box>

          <Box>
            <Button
              onClick={() => setPageState(1)}
              color="primary"
              sx={{ mr: 5 }}
              variant="outlined"
              startIcon={<VideogameAssetIcon />}
            >
              Play A Game
            </Button>
          </Box>
          {/* Button to be displayed instead of profile when use not logged in*/}
          {/* <Button color="inherit">Login</Button> */}

          {/* Profile picture with context menu */}
          <Box>
            <Tooltip title="Open settings">
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{ p: 0 }}
              >
                <Avatar alt="Remy" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={onClickProfile}
                >
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
    </AppBar>
  );
}
export default TopBar;
