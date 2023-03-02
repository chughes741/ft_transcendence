import { useState } from 'react'
import styled from 'styled-components';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import Input from "../components/Input";
import Button from "../components/Button";
import Icon from "../components/Icon";

export default function Login() {
  const [nick, setNick] = useState('');
  const [pass, setPass] = useState('');

  const GoogleBackground = "white";
  const FacebookBackground = "linear-gradient(to right, #14163c 0%, #03217b 79%)";

  const handleNick = (event) => {
    setNick(event.target.value);
  };

  const handlePass = (event) => {
    setPass(event.target.value);
  };

   function handleSubmit(){
    if (nick === 'BigBoss') {
      console.log("AFDHDHFA");
      return;
    }
  };
  return (

/*    <div className="wrapper">
      <form className="form" onSubmit={handleSubmit} action="/login">
        <div className="login-container">
          <div className="login-info-container">
            <input required value={nick} onChange={handleNick} className="login-field" type="text" placeholder="Nickname" />
          </ div>
          <div className="login-info-container">
            <input value={pass} onChange={handlePass} required className="login-field" type="password" placeholder="Password" />
          </div>
          <div className="login-info-container">
            <button className="bouton main" type="submit">Connect</button>
          </div>
        </div>
      </form>
      NICK = {nick}
      <br/>
      PASS = {pass}
    </div>
*/
    <MainContainer>
    <WelcomeText>welcome</WelcomeText>
    <InputContainer>
      <Input type="text" placeholder="nickname" />
      <Input type="password" placeholder="password" />
    </InputContainer>
    <ButtonContainer>
      <Button content="Stay a while and listen" />
    </ButtonContainer>
    <LoginWith>or login with </LoginWith>
    <HorizontalRule />
    <IconsContainer>
      <Icon color={GoogleBackground}>
       <FcGoogle />
      </Icon>
      <Icon color={FacebookBackground}>
        <FaFacebookF />
      </Icon>
    </IconsContainer>
    <ForgotPassword>forgot password</ForgotPassword>
  </MainContainer>
  )
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
    height: 90vh;
    p {
      font-size: small;
    }
  }

  @media only screen and (min-width:411px) {
    width: 80vw;
    height: 90vh;
  }

  @media only screen and (min-width:768px) {
    width: 80vw;
    height: 90vh;
  }

  @media only screen and (min-width:1024px) {
    width: 30vw;
    height: 90vh;
  }
`;


const WelcomeText = styled.p`
  margin: 3rem auto 2rem;
  font-weight: 400;
  font-size: 20px;
  display: flex;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 20%;
  width: 100%;
`;

const ButtonContainer = styled.div`
  margin: 1rem 0 2rem 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoginWith = styled.h5`
  cursor: pointer;
`;

const HorizontalRule = styled.hr`
  width: 90%;
  height: 0.3rem;
  border-radius: 0.8rem;
  border: none;
  margin: 1.5em 0 1rem 0;
  background: linear-gradient(to right, #14163c 0%, #03217b 79%);
  backdrop-filter: blur(25px);
`;

const IconsContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin: 2rem 0 3rem 0;
  width: 80%;
`;

const ForgotPassword = styled.h4`
  cursor: pointer;
`;

