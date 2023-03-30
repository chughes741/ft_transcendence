import React, { useContext, useEffect } from "react";
import { Menu, MenuItem } from "@mui/material";
import ChatContext from "./ChatContext";

type ContextMenuOption = {
  label: string;
  onClick: () => void;
};

type ContextMenuProps = {
  position: { x: number; y: number };
  options: ContextMenuOption[];
};

const ContextMenu: React.FC<ContextMenuProps> = ({ position, options }) => {
  const { contextMenuVisible, setContextMenuVisible } = useContext(ChatContext);
  const { x, y } = position;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuVisible) {
        const target = e.target as HTMLElement;
        if (!target.closest(".MuiMenu-paper")) {
          setContextMenuVisible(false);
        }
      }
    };
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [contextMenuVisible]);

  return (
    <Menu
      anchorReference="anchorPosition"
      anchorPosition={{ top: y, left: x }}
      open={contextMenuVisible}
      onClose={() => setContextMenuVisible(false)}
    >
      {options.map((option, index) => (
        <MenuItem
          key={index}
          onClick={option.onClick}
        >
          {option.label}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ContextMenu;
