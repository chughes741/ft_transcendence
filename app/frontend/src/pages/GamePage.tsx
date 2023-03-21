import React from 'react';
import { Helmet } from "react-helmet";
import SideBar from "src/components/SideBar";
import GameSideBar from "src/components/GameSideBar";
import Game from "src/pages/game/GameWindow";
import "src/pages/GamePage.tsx.css";
import {useState} from "react";




export default function GamePage() {
  const [isActive, setIsActive] = useState(false);

  function clickPopUp() {
    setIsActive(!isActive);
  }
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
          <div 
            className="game-side-bar-area"
          >
            <GameSideBar />
          </div>
        </div>
      </div>
    </>
  );
}
