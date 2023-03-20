import { BsChatText, BsGear, BsHouse, BsPerson, BsPlay } from "react-icons/bs";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link } from "react-router-dom";

import "./SideBar.tsx.css";

export default function SideBar() {
  return (
    <div id="side-bar">
      <Sidebar
        defaultCollapsed
        collapsedWidth="80px"
      >
        <Menu>
          <MenuItem
            icon={<BsHouse />}
            component={<Link to="/" />}
          >
            {" "}
          </MenuItem>
          <MenuItem
            icon={<BsPerson />}
            component={<Link to="/profile" />}
          >
            {" "}
          </MenuItem>
          <MenuItem
            icon={<BsChatText />}
            component={<Link to="/chat" />}
          >
            {" "}
          </MenuItem>
          <MenuItem
            icon={<BsPlay />}
            component={<Link to="/game" />}
          >
            {" "}
          </MenuItem>
          {/** @todo settings page? */}
          <MenuItem
            icon={<BsGear />}
            component={<Link to="/" />}
          >
            {" "}
          </MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
}
