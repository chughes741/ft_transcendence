import { useState, useEffect } from 'react'
import styled from 'styled-components';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import Input from "../components/Input";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { useNavigate } from "react-router-dom";
import React from 'react';
import "./LoginPage.tsx.css";

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

export default function LoginPage() {

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
  }

  return (
    <div className="main-container">
      <WelcomeText>welcome</WelcomeText>
      <form className="styled-form" onSubmit={HandleSubmit}>
        <InputContainer>
          <Input value={nick} onChange={handleNick} type="text" placeholder="Nickname" />
          <Input value={pass} onChange={handlePass}  type="password" placeholder="Password" />
        </InputContainer>
        <ButtonContainer>
          <Button onSubmit={HandleSubmit} onClick={null} content="Stay a while and listen" />
        </ButtonContainer>
      </form>
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
    </div>
  );
}

