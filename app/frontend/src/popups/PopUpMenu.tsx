import "./PopUpMenu.tsx.css";
import Icon from "../components/Icon";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

import { FiMenu } from "react-icons/fi";

export default function PopUpMenu() {
  const [isActive, setIsActive] = useState(false);

  const navigate = useNavigate();
  const bngColor = "";

  function closePopUp() {
    setIsActive(false);
  }

  function clickPopUp() {
    setIsActive(!isActive);
  }

  function nav(url) {
    navigate("/" + url);
  }

  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.keyCode === 27 || event.key === "Escape") {
        closePopUp();
      }
    }
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  });

  return (
    <>
      <div className="icon">
        <Icon
          color={bngColor}
          onClick={clickPopUp}
        >
          <FiMenu className="menu-icon" />
        </Icon>
      </div>
      <div
        className={`popup-container ${isActive ? "active" : ""}`}
        id="popup"
      >
        <div
          className={`blocker ${isActive ? "active" : ""}`}
          onClick={closePopUp}
        />
        <div className="button-container-popup">
          <div
            className={`button-popup ${isActive ? "active" : ""}`}
            onClick={() => nav("gametest")}
          >
            Game
          </div>
        </div>
        <div className="button-container-popup">
          <div
            className={`button-popup ${isActive ? "active" : ""}`}
            onClick={() => nav("chattest")}
          >
            Chat
          </div>
        </div>
        <div className="button-container-popup">
          <div
            className={`button-popup ${isActive ? "active" : ""}`}
            onClick={() => nav("login")}
          >
            Login
          </div>
        </div>
      </div>
    </>
  );
}
