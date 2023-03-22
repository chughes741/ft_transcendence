import React, { useContext, useEffect } from "react";
import "src/pages/Chat/styles/ChatPage.css";
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
  const displayStyle = contextMenuVisible ? "block" : "none";

  // Unfocus if clicked elsewhere
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuVisible) {
        const target = e.target as HTMLElement;
        if (!target.closest(".context-menu")) {
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
    <div
      className="context-menu"
      style={{
        display: displayStyle,
        top: `${y}px`,
        left: `${x}px`
      }}
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
};

export default ContextMenu;
