import React, { useRef } from "react";
import "../styles/Page.css";

type ContextMenuOption = {
  label: string;
  onClick: (() => void) | ((string) => void);
};
type ContextMenuProps = {
  options: ContextMenuOption[];
  data?: any; // You can replace 'any' with the specific type of data you want to pass, e.g. RoomType
};

const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ options, data }, ref) => {
    return (
      <div
        className="context-menu"
        ref={ref}
      >
        <ul>
          {options.map((option, index) => (
            <li
              className="glowing-text"
              key={index}
              onClick={option.onClick}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

export default ContextMenu;
