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
import { IconButton } from "@mui/material";
import { PageState } from "src/root.model";
import { useProfileViewModelContext } from "src/profile/profile.viewModel";
import { SportsEsports } from "@mui/icons-material";
import DynamicIconButton from "../DynamicIconButton";
import { useRootViewModelContext } from "src/root.context";
import { useSettingsViewModelContext } from "../settings/settings.viewModel";

//Set css flexbox options for the toolbar component to create proper object positioning for child elements
const toolbarStyle = {
  display: "flex",
  justifyContent: "space-between"
};

export default function TopBar() {
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

  const onClickLogout = () => {
    /** @todo add logout function */
    handleCloseUserMenu();
  };

  console.log("ICI EST LE SEELF MA MAN", self);
  return (
    <AppBar
      position="static"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, flexGrow: 0 }}
    >
      <Toolbar
        disableGutters
        style={toolbarStyle}
      >
        {/* Logo button */}
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

        {/* New game button */}
        <Box>
          <DynamicIconButton
            text="New Game"
            icon={
              <SportsEsports style={{ fontSize: "2rem", color: "white" }} />
            }
            onClick={() => setPageState(PageState.Game)}
          />
        </Box>
        {/* User menu */}
        <Box>
          <IconButton
            onClick={handleOpenUserMenu}
            sx={{ p: 0, mr: "1rem", ml: "1rem" }}
            disableRipple={true}
            disableFocusRipple={true}
          >
            {self && (
              <>
                <Box sx={{ marginRight: "0.5vw", fontWeight: "600" }}>
                  {self.username}
                </Box>
                <Avatar
                  src={self.avatar}
                  sx={{ width: "4rem", height: "4rem" }}
                />
              </>
            )}

          </IconButton>
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
            <MenuItem onClick={onClickLogout}>
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
