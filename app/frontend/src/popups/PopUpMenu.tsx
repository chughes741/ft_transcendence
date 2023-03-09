import "./PopUpMenu.tsx.css";
import Icon from "../components/Icon";
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import { FiMenu } from 'react-icons/fi';

class IdCtx {
  id: string;
}

export default function PopUpMenu(IdCtx: IdCtx) {

  const [isActive, setIsActive] = useState(false);

  const navigate = useNavigate();
  const bngColor = "linear-gradient(to right, #14163c 0%, #03217b 79%)";
 
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
      if (event.keyCode === 27 || event.key === 'Escape') {
        closePopUp();
      }
    }
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  })

  return (
    <>
     <div className="icon">
        <Icon color={bngColor} onClick={clickPopUp}>
          <FiMenu />
        </Icon>
      </div>
      <div className={`popup-container ${isActive ? 'active' : ''}`} id={IdCtx.id}>
       <div className="blocker" onClick={closePopUp} />
       <div className="button-container">
         <button className={`button-popup ${isActive ? 'active' : ''}`} onClick={()=>nav('gametest')}>Game</button>
       </div>
       <div className="button-container">
         <button className={`button-popup ${isActive ? 'active' : ''}`} onClick={()=>nav('chattest')}>Chat</button>
       </div>
       <div className="button-container">
         <button className={`button-popup ${isActive ? 'active' : ''}`} onClick={()=>nav('login')}>Login</button>
       </div>
     </div>
    </>
  );
}
