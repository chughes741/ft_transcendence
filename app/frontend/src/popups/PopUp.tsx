import styled from 'styled-components';
import Button from '../components/Button';
import "./PopUp.tsx.css";
import { useNavigate } from 'react-router-dom';
import Icon from "../components/Icon";
import { FiMenu } from 'react-icons/fi';

const IconsContainer = styled.div`
  display: flex;
  margin: 1rem 0 0 1rem;
  width: 80%;
  height: 100vh;
`;

export default function PopUp({ id }) {

  const navigate = useNavigate();
    const bngColor = "linear-gradient(to right, #14163c 0%, #03217b 79%)";


  function closePopUp() {
    document.querySelector("#popup").classList.remove('active');
    return ;
  }
    function clickPopup()   {
      if (document.querySelector("#popup").classList.contains('active')) {
        document.querySelector("#popup-button-game").classList.remove('active');
        document.querySelector("#popup-button-login").classList.remove('active');
        document.querySelector("#popup-button-chat").classList.remove('active');
        document.querySelector("#popup").classList.remove('active');
      }
      else {
        document.querySelector("#popup").classList.add('active');
        document.querySelector("#popup-button-game").classList.add('active');
        document.querySelector("#popup-button-login").classList.add('active');
        document.querySelector("#popup-button-chat").classList.add('active');
      }
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
     <IconsContainer className="icon">
        <Icon color={bngColor} onClick={clickPopup}>
          <FiMenu />
        </Icon>
      </IconsContainer>
      <div className="popup-container" id={id}>
        <div className="button-container" >
         <button className="button-popup" id="popup-button-game" onClick={navGame}>Game</button>
        </div>
        <div className="button-container" >
         <button className="button-popup" id="popup-button-chat" onClick={navChat}>Chat</button>
        </div>
        <div className="button-container" >
         <button className="button-popup" id="popup-button-login" onClick={navLogin}>Login</button>
        </div>
      </div>
    </>
  );
}
