import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import SidebarChatOptions from "./sidebar.chatoptions";
import RoomList from "../../pages/chat/components/RoomList";

const drawerWidth = "20%";

/**
 * Creates the side bar component
 * @param - Current page state
 * @returns - Box containing sidebar
 */
export default function SideBar({ setPageState }) {
  return (
      <>
        <Box>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              position:"fixed", top: "87px"
            }
          }}

        >
          <Box sx={{ overflow: "hidden" }}>
            <SidebarChatOptions setPageState={setPageState} />
            <Divider />
          </Box>
          <Box sx={{ overflow: "hidden auto" }}>
            <RoomList />
          </Box>
        </Drawer>
        </Box>
      </>
  );
}
