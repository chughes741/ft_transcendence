import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import { LogoSvg } from "./logoComponent";
import { ButtonUnstyled } from "@mui/base";
import { Tooltip } from "@mui/material";
import { PageState } from "src/root.model";
import { useProfileViewModelContext } from "src/Profile/Profile.viewModel";
import ButtonFunky from "src/components//ButtonFunky";

const settings = ["Profile", "Settings", "Logout"];

//Set css flexbox options for the toolbar component to create proper object positioning for child elements
const toolbarStyle = {
  display: "flex",
  justifyContent: "space-between"
};

function TopBar({ setPageState }) {
  const { profile, setUser } = useProfileViewModelContext();
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
    setUser("schlurp");
    setPageState(PageState.Profile);
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

        <Box sx={{ width: "20vw", maxHeight: "20vh" }}>
          <ButtonFunky
            content={"Play a game"}
            width={"100%"}
            onClick={() => setPageState(PageState.Game)}
          />
        </Box>
        {/* Button to be displayed instead of profile when use not logged in*/}
        {/* <Button color="inherit">Login</Button> */}

        {/* Profile picture with context menu */}
        <Box>
          <Tooltip title="Open settings">
            <IconButton
              onClick={handleOpenUserMenu}
              sx={{ p: 0, mr: 2 }}
            >
              {profile !== null ? (
                <Avatar src={profile.avatar} />
              ) : (
                <Avatar alt="" />
              )}
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
