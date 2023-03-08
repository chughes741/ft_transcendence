import "./PopUp.tsx.css";
import Icon from "../components/Icon";
import { useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

export default function PopUp({ id }) {

  const navigate = useNavigate();
  const bngColor = "linear-gradient(to right, #14163c 0%, #03217b 79%)";

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
     <div className="icon">
        <Icon color={bngColor} onClick={clickPopup}>
          <FiMenu />
        </Icon>
      </div>
      <div className="popup-container" id={id}>
      <div className="blocker" onClick={clickPopup} />
        <div className="button-container">
         <button className="button-popup" id="popup-button-game" onClick={navGame}>Game</button>
        </div>
        <div className="button-container">
         <button className="button-popup" id="popup-button-chat" onClick={navChat}>Chat</button>
        </div>
        <div className="button-container">
         <button className="button-popup" id="popup-button-login" onClick={navLogin}>Login</button>
        </div>
      </div>
    </>
  );
}
