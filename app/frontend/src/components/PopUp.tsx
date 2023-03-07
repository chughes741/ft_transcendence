import styled from 'styled-components';
import Button from './Button.tsx';

export default function PopUp({ id }) {
  function closePopUp() {
    document.querySelector("#popup").classList.remove('active');
    return ;
  }

  return (
    <>
      <PopUpContainer id={id}>
        <Button onClick={closePopUp} content="Fermer" />
      </PopUpContainer>
    </>
  );
}

const PopUpContainer = styled.div`
  &.active {
    margin-top: 1rem;
    width: 30vw;
    height: 90vh;
    color: red;
    position: absolute;
    background-color: green;
    z-index: 1000;
    display: flex;
    color: white;
  }
  position: absolute;
  display: none;
  z-index: -1;

`;