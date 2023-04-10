import React, { useState, useEffect } from "react";
import { Menu, MenuItem } from "@mui/material";

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
  let hoverTimeout: ReturnType<typeof setTimeout>;

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
      onClose={() => {
        setContextMenuVisible(false);
      }}
    >
      {options.map((option, index) => (
        <MenuItem
          key={index}
          onClick={option.onClick}
          onMouseEnter={(e) => {
            clearTimeout(hoverTimeout);
            if (option.submenu) {
              setAnchorEl(e.currentTarget);
            }
          }}
          onMouseLeave={() => {
            hoverTimeout = setTimeout(() => {
              setAnchorEl(null);
            }, 1000);
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
              onMouseEnter={() => clearTimeout(hoverTimeout)}
              onMouseLeave={() => {
                hoverTimeout = setTimeout(() => {
                  setAnchorEl(null);
                }, 1000);
              }}
            >
              {option.submenu.map((submenuOption, submenuIndex) => (
                <MenuItem
                  key={submenuIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    submenuOption.onClick && submenuOption.onClick();
                  }}
                >
                  {submenuOption.label}
                </MenuItem>
              ))}
            </Menu>
          )}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ContextMenu;
