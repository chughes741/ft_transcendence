import { Canvas } from "@react-three/fiber";
import { Helmet } from "react-helmet";
import SideBar from "src/components/SideBar";
import Game from "src/pages/game/GameWindow";
import "src/pages/GamePage.tsx.css";

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
