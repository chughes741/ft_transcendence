import { useState } from 'react'
import "./GameSideBar.tsx.css"

export default function GameSideBar() {
  const [ active, setActive ] = useState(false);

  function onClick() {
    setActive(!active);
  }

  return (
    <>
      <div className={`game-side-bar-overlay ${active ? "active" : ""}`} onClick={onClick}></div>
      <div className={`game-side-bar ${active ? "active" : ""}`}>
        <div onClick={onClick} className={`test ${active ? "active" : ""}`}>
          AHH
        </div>
        <div className={`test2 ${active ? "active" : ""}`}>
          OHHHHHHHHHH
        </div>
      </div>
    </>
  );
}
