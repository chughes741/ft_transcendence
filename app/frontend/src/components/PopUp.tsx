import styled from 'styled-components';
import Button from './Button';
import "./PopUp.tsx.css";
import { useNavigate } from 'react-router-dom';

export default function PopUp({ id }) {

  const navigate = useNavigate();

  function closePopUp() {
    document.querySelector("#popup").classList.remove('active');
    return ;
  }

  function navGame() {
    navigate("/gametest");
  }

  function navChat() {
    navigate("/chattest");
  }

  function navLogin() {
    navigate("/login");
  }

  return (
    <>
      <div className="popup-container" id={id}>
        <div className="button-container">
          <Button onClick={navGame} onSubmit={null} content="Game" />
          <Button onClick={navChat} onSubmit={null} content="Chat" />
          <Button onClick={navLogin} onSubmit={null} content="Login" />
        </div>
          <button className="close-button" onClick={closePopUp}>Fermer</button>
      </div>
    </>
  );
}
