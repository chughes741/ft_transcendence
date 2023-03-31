import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import { Container } from "@mui/material";
import ChatList from "./ChatList";
import SidebarChatOptions from "./sidebar.chatoptions";

const drawerWidth = 300;

export default function SideBar({ setPageState }) {
  return (
    <Container sx={{ display: "flex", flexDirection: "column" }}>
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
            <SidebarChatOptions setPageState={setPageState} />
            <Divider />
            <ChatList />
          </Box>
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, mt: 5 }}
        ></Box>
      </Box>
    </Container>
  );
}
