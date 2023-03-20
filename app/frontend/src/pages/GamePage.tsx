import { Helmet } from "react-helmet";
import SideBar from "src/components/SideBar";
import Game from "src/pages/game/GameWindow";
import "src/pages/GamePage.tsx.css";
import {useState} from "react";


// const [isActive, setIsActive] = useState(false);
//
// function clickPopUp() {
//   setIsActive(!isActive);
// }

// lassName={`game-side-bar ${isActive ? "active" : ""}`} onClick={clickPopUp}
export default function GamePage() {
  return (
    <>
      <Helmet>
        <title>
          Transcendence | Game <i>Hello</i>
        </title>
      </Helmet>
      <div className="game-page">
        <SideBar />
        <div className="game-window">
          <div className="game-container">
            <Game />
          </div>
          <div className="game-side-bar">
            <div className="accept-side-bar">
            </div>
            <div className="chat-side-bar">
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
