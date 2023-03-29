import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import { Container } from "@mui/material";
import ChatList from "./ChatList";
import TopBar from "../TopBar/TopBar";

const drawerWidth = 240;

export default function SideBar() {
  return (
    <Container sx={{ display: "flex", flexDirection: "column" }}>
      <TopBar/>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box"
            }
          }}
        >
          <Toolbar sx={{ height: 100 }} />
          <Box sx={{ overflow: "auto" }}>
            <List>
              <ListItem key="Hello" disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <InboxIcon />
                  </ListItemIcon>
                  <ListItemText primary="Hello" />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider />
            <ChatList />
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 5 }}>
        </Box>
      </Box>
    </Container>
  );
}
