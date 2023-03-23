import React from 'react';
import {Helmet} from "react-helmet";
import SideBar from "src/components/SideBar";
import GameSideBar from "src/components/GameSideBar";
import Game from "src/pages/game/GameWindow";
import "src/pages/GamePage.tsx.css";
import {useState} from "react";
import Button from "@mui/material/Button"

export default function GamePage() {

  const [buttonIsActive, setButtonActive] = useState(false);
  const [chatIsActive, setChatActive] = useState(false);
  const [chatButtonIsActive, setChatButtonActive] = useState(true);

  function ClickJoinLobby() {
    console.log("clicker join lobby");
    setButtonActive(true);
  }

  function ClickCancel() {
    console.log("clicked cancel");
    setButtonActive(false);
    setChatActive(false);
  }

  function ClickChat() {
    setChatActive(!chatIsActive);
    setChatButtonActive(!chatButtonIsActive);
  }

  return (
    <>
      <Helmet>
        <title>
          Transcendence | Game
        </title>
      </Helmet>
      <div className="game-page">
        <SideBar/>
        <div className="game-window">
          <div className="game-container">
            <Game/>
          </div>
          <div className="buttons-container">
            <div className={`button-wrapper ${buttonIsActive ? "button-inactive" : ""}`}>
              <Button variant="contained" className="join-lobby" onClick={ClickJoinLobby}>Joino auno loobyo</Button>
            </div>
            <div className={`button-wrapper ${buttonIsActive ? "" : "button-inactive"}`}>
              <Button variant="contained" onClick={ClickCancel}>Cancellllio</Button>
            </div>
            <div className={`button-wrapper ${buttonIsActive ? "" : "button-inactive"}`}>
              <Button variant="contained"
                      onClick={ClickChat}
                      className={`chat-button ${chatButtonIsActive ? "" : "close-active"}`}>
                Open chat
              </Button>
              <Button variant="contained" onClick={ClickChat} className={`chat-button ${chatButtonIsActive ? "close-active" : ""}`}>Close chat</Button>
            </div>

          </div>
          <div className={`game-side-bar-area ${chatIsActive ? "" : "inactive"}`}>
            <GameSideBar />
          </div>
        </div>
      </div>
    </>
  );
}
