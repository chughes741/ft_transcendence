import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import SidebarChatOptions from "./sidebar.chatoptions";
import RoomList from "../../chat/components/RoomList";

const drawerWidth = "20%";

/**
 * Creates the side bar component
 *
 * @returns {JSX.Element} - Side bar component
 */
export default function SideBar() {
  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            position: "fixed",
            top: "87px"
          }
        }}
      >
        <Box sx={{ overflow: "hidden" }}>
          <SidebarChatOptions />
          <Divider />
        </Box>
        <Box sx={{ overflow: "hidden auto", maxHeight: "66vh" }}>
          <RoomList />
        </Box>
      </Drawer>
    </>
  );
}
