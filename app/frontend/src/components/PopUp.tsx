import styled from 'styled-components';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

export default function PopUp({ id }) {

const CloseButton = styled.button`
  width: 5vw;
  height: 10vh;
  color: blue;
`;

const ButtonContainer = styled.div`
  margin: 1rem 0 2rem 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PopUpContainer = styled.div`
  position: absolute;
  display: none;
  z-index: -1;
  &.active {
    width: 20vw;
    height: 95vh;
    color: red;
    position: absolute;
    background-color: green;
    z-index: 1000;
    display: flex;
    color: #fff;
  }
`;

  const navigate = useNavigate();

  function closePopUp() {
    document.querySelector("#popup").classList.remove('active');
    return ;
  }
  function navGame() {
    navigate("/gametest");
  }

  return (
    <>
      <PopUpContainer id={id}>
        <ButtonContainer>
          <Button onClick={navGame} onSubmit={null} content="Game" />
        </ButtonContainer>
          <CloseButton onClick={closePopUp}>Fermer</CloseButton>
      </PopUpContainer>
    </>
  );
}
