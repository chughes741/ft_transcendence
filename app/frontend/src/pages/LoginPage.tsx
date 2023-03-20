import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import Input from "../components/Input";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PopUpMenu from "../popups/PopUpMenu";
import { useNavigate } from "react-router-dom";
import React from "react";
import "./LoginPage.tsx.css";

type LoginCredentials = {
  email: string;
  pass: string;
};

export default function LoginPage() {
  const FacebookBackground =
    "linear-gradient(to right, #14163c 0%, #03217b 79%)";

  const [nick, setNick] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("Login");
    return () => {
      document.body.classList.remove("Login");
    };
  });

  const handleNick = (event) => {
    setNick(event.target.value);
  };

  const handlePass = (event) => {
    setPass(event.target.value);
  };

  function handleSubmit() {
    const loginCredentials: LoginCredentials = {
      email: nick,
      pass
    };
    setNick("");
    setPass("");
    // if (nick === "BigBoss" && pass === "Test123!") navigate("/welcome");

    console.log(loginCredentials);
    navigate("/welcome");

    // else navigate("/login");
  }

  return (
    <>
      <PopUpMenu />
      <div className="main-container">
        <p>welcome</p>
        <form
          className="styled-form"
          onSubmit={handleSubmit}
        >
          <div className="input-container">
            <Input
              value={nick}
              onChange={handleNick}
              type="text"
              placeholder="Nickname"
            />
            <Input
              value={pass}
              onChange={handlePass}
              type="password"
              placeholder="Password"
            />
          </div>
          <div className="button-container">
            <Button
              content="Stay a while and listen"
              onClick={null}
              width="35px"
            />
          </div>
        </form>
        <hr className="horizontal-rule" />
        <h5>or login with </h5>
        <div className="icon-container">
          <Icon
            onClick={null}
            color="#FaFacebookF"
          >
            <FcGoogle />
          </Icon>
          <Icon
            onClick={null}
            color={FacebookBackground}
          >
            <FaFacebookF />
          </Icon>
        </div>
        <h4>forgot password</h4>
        NICK = {nick}
        <br />
        PASS = {pass}
      </div>
    </>
  );
}
