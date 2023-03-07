import { useEffect } from 'react';
import styled from 'styled-components';

export default function WelcomePage() {

  useEffect(() => {
    document.body.classList.add('Welcome');
    return () => {
      document.body.classList.remove('Welcome');
    };
  });
  return (
      <>
        <MainContainer>
          <div>ashdgaskjdhalkhdsalkjdahs</div>
        </MainContainer>
      </>
  );
}

const MainContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 80vh;
  width: 30vw;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37);
  backdrop-filter: blur(8.5px);
  border-radius: 10px;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.4rem;
  user-select: none;
  @media only screen and (max-width:320px) {
    width: 80vw;
    height: 90vh;
    hr {
      margin-bottom: 0.3rem;
    }
    p {
      font-size: small;
    }
  }

  @media only screen and (min-width:360px) {
    width: 80vw;
    height: 80vh;
    p {
      font-size: small;
    }
  }

  @media only screen and (min-width:411px) {
    width: 80vw;
    height: 80vh;
  }

  @media only screen and (min-width:768px) {
    width: 80vw;
    height: 80vh;
  }

  @media only screen and (min-width:1024px) {
    width: 30vw;
    height: 90vh;
  }
`;