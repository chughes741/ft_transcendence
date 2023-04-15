import React, { useState, useEffect } from "react";
import { Divider, Menu, MenuItem } from "@mui/material";

type ContextMenuOption = {
  label: string;
  onClick?: () => void;
  submenu?: ContextMenuOption[];
};

type ContextMenuProps = {
  position: { x: number; y: number };
  options: ContextMenuOption[];
  contextMenuVisible: boolean;
  setContextMenuVisible: (arg: boolean) => void;
};

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  options,
  contextMenuVisible,
  setContextMenuVisible
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { x, y } = position;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuVisible) {
        const target = e.target as HTMLElement;
        const isOutsideMenu = !target.closest(".MuiMenu-paper");
        const isOutsideSubmenu = !target.closest(
          ".MuiMenu-paper.MuiMenu-paper"
        );

        if (isOutsideMenu) {
          console.log("click outside, closing context menu");
          setContextMenuVisible(false);
        }
        if (isOutsideSubmenu && anchorEl) {
          setAnchorEl(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [contextMenuVisible, anchorEl]);

  return (
    <Menu
      anchorReference="anchorPosition"
      anchorPosition={{ top: y, left: x }}
      open={contextMenuVisible}
      onClose={() => {
        setContextMenuVisible(false);
      }}
    >
      {options.map((option, index) => {
        if (option.label === "---") {
          return <Divider key={index} />;
        }

        return (
          <MenuItem
            key={index}
            onClick={(e) => {
              if (option.submenu) {
                e.stopPropagation();
                setAnchorEl(anchorEl ? null : e.currentTarget);
              } else if (option.onClick) {
                e.stopPropagation();
                option.onClick();
              }
            }}
          >
            {option.label}
            {option.submenu && (
              <Menu
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                {option.submenu.map((submenuOption, submenuIndex) => (
                  <MenuItem
                    key={submenuIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnchorEl(null);
                      submenuOption.onClick && submenuOption.onClick();
                    }}
                  >
                    {submenuOption.label}
                  </MenuItem>
                ))}
              </Menu>
            )}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default ContextMenu;
