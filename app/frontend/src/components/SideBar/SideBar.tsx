import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import { Container } from "@mui/material";
import SidebarChatOptions from "./sidebar.chatoptions";
import RoomList from "../../pages/chat/components/RoomList";

const drawerWidth = "20%";

export default function SideBar({ setPageState }) {
  return (
      <Box id="sidebar" sx={{ display: "flex" }}>
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
          <Box sx={{ overflow: "hidden" }}>
            <SidebarChatOptions setPageState={setPageState} />
            <Divider />
          </Box>
          <Box sx={{ overflowY: "auto", overflowX: "hidden" }}>
            <RoomList />
          </Box>
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, mt: 5 }}
        ></Box>
      </Box>
  );
}
