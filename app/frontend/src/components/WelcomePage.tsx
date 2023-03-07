import { useEffect } from 'react';
import styled from 'styled-components';
import Icon from "./Icon.tsx";
import PopUp from './PopUp.tsx';
import { FiMenu } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";


export default function WelcomePage() {

  const navigate = useNavigate();
  const bngColor = "linear-gradient(to right, #14163c 0%, #03217b 79%)";

  useEffect(() => {
    document.body.classList.add('Welcome');
    return () => {
      document.body.classList.remove('Welcome');
    };
  });

  function clickPopup()   {
    document.querySelector("#popup").classList.add('active');

  };

  return (
      <>
      <PopUp id="popup"/>
        <MainContainer>
        <IconsContainer>
          <Icon color={bngColor} onClick={clickPopup}>
            <FiMenu />
          </Icon>
        </IconsContainer>
        </MainContainer>
      </>
  );
}

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 80vh;
  width: 90vw;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37);
  backdrop-filter: blur(8.5px);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.4rem;
  user-select: none;
  @media only screen and (max-width:320px) {
    width: 95vw;
    height: 95vh;
    hr {
      margin-bottom: 0.3rem;
    }
    p {
      font-size: small;
    }
  }

  @<p></p>media only screen and (min-width:360px) {
    width: 95vw;
    height: 95vh;
    p {
      font-size: small;
    }
  }

  @media only screen and (min-width:411px) {
    width: 95vw;
    height: 95vh;
  }

  @media only screen and (min-width:768px) {
    width: 95vw;
    height: 95vh;
  }

  @media only screen and (min-width:1024px) {
    width: 100vw;
    height: 100vh;
  }
`;

const IconsContainer = styled.div`
  display: flex;
  margin: 1rem 0 0 1rem;
  width: 80%;
`;