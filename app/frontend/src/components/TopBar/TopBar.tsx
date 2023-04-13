import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import { LogoSvg } from "./logoComponent";
import { ButtonUnstyled } from "@mui/base";
import { IconButton, Tooltip } from "@mui/material";
import { PageState } from "src/root.model";
import { useProfileViewModelContext } from "src/profile/profile.viewModel";
import ButtonFunky from "src/components/ButtonFunky";
import { SportsEsports } from "@mui/icons-material";
import DynamicIconButton from "../DynamicIconButton";
import { useRootViewModelContext } from "src/root.context";
import { useSettingsViewModelContext } from "../settings/settings.viewModel";

//Set css flexbox options for the toolbar component to create proper object positioning for child elements
const toolbarStyle = {
  display: "flex",
  justifyContent: "space-between"
};

function TopBar() {
  const { setPageState } = useRootViewModelContext();
  const { setUser } = useProfileViewModelContext();
  const { self } = useRootViewModelContext();
  const { handleOpenSettings } = useSettingsViewModelContext();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const onClickProfile = () => {
    setUser(self.username);
    setPageState(PageState.Profile);
    handleCloseUserMenu();
  };

  const onClickSettings = () => {
    handleOpenSettings();
    handleCloseUserMenu();
  };

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

        <Box sx={{ flexGrow: 1 }}>
          <ButtonUnstyled
            onClick={() => setPageState(PageState.Home)}
            style={{
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              paddingTop: "2vh",
              paddingLeft: "1vw"
            }}
          >
            <LogoSvg />
          </ButtonUnstyled>
        </Box>

        <Box>
          <DynamicIconButton
            text="New Game"
            icon={
              <SportsEsports style={{ fontSize: "2rem", color: "white" }} />
            } // Adjust the size accordingly
            onClick={() => setPageState(PageState.Loader)}
          />
        </Box>

        {/* FIXME: If I remove this, the colors are fucked */}
        {false && (
          <Box sx={{ width: "20vw", maxHeight: "20vh" }}>
            <ButtonFunky
              content={""}
              width={"0%"}
            />
          </Box>
        )}
        {/* Button to be displayed instead of profile when use not logged in*/}
        {/* <Button color="inherit">Login</Button> */}

        {/* Profile picture with context menu */}
        <Box>
          <Tooltip title="Open settings">
            <IconButton
              onClick={handleOpenUserMenu}
              sx={{ p: 0, mr: 2 }}
            >
              <Avatar src={self.avatar} />
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
            <MenuItem onClick={onClickProfile}>
              <Typography textAlign="center">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={onClickSettings}>
              <Typography textAlign="center">Settings</Typography>
            </MenuItem>
            <MenuItem onClick={onClickProfile}>
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default TopBar;
