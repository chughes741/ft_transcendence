import { useState, useEffect } from 'react'
import styled from 'styled-components';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import Input from "./Input";
import Button from "./Button";
import Icon from "./Icon";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
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

const Form = styled.form`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 30vh;
  margin: 0;
  width: 30vw;
  border-radius: 10px;
  letter-spacing: 0.4rem;

  @media only screen and (min-width:360px) {
    width: 80vw;
    height: 30vh;
    p {
      font-size: small;
    }
  }

  @media only screen and (min-width:411px) {
    width: 80vw;
    height: 30vh;
  }

  @media only screen and (min-width:768px) {
    width: 80vw;
    height: 30vh;
  }

  @media only screen and (min-width:1024px) {
    width: 30vw;
    height: 30vh;
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
  height: 60%;
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

  const GoogleBackground = "white";
  const FacebookBackground = "linear-gradient(to right, #14163c 0%, #03217b 79%)";

  const [nick, setNick] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('Login');
    return () => {
      document.body.classList.remove('Login');
    };
  });

  const handleNick = (event) => {
  setNick(event.target.value);
  };
  const handlePass = (event) => {
    setPass(event.target.value);
  };
  function HandleSubmit(){
    if (nick === 'BigBoss' && pass === "Test123!")
      navigate("/welcome");
    else
      navigate("");
    return;
  }

  return (
    <MainContainer>
      <WelcomeText>welcome</WelcomeText>
      <Form onSubmit={HandleSubmit}>
        <InputContainer>
          <Input value={nick} onChange={handleNick} type="text" placeholder="nickname" />
          <Input value={pass} onChange={handlePass}  type="password" placeholder="password" />
        </InputContainer>
        <ButtonContainer>
          <Button onSubmit={HandleSubmit} onClick={null} content="Stay a while and listen" />
        </ButtonContainer>
      </Form>
      <LoginWith>or login with </LoginWith>
      <HorizontalRule />
      <IconsContainer>
        <Icon onClick={null} color={GoogleBackground}>
         <FcGoogle />
        </Icon>
        <Icon onClick={null} color={FacebookBackground}>
          <FaFacebookF />
        </Icon>
      </IconsContainer>
      <ForgotPassword>forgot password</ForgotPassword>
      NICK = {nick}
      <br />
      PASS = {pass}
    </MainContainer>
  );
}

