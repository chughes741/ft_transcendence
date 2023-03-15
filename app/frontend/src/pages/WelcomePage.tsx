import { useEffect } from "react";
import PopUpMenu from "../popups/PopUpMenu";
import "./WelcomePage.tsx.css";
import { useOutletContext } from 'react-router-dom';

type OuletContext = {
  name: string;
}

export default function WelcomePage() {
  useEffect(() => {
    document.body.classList.add("Welcome");
    return () => {
      document.body.classList.remove("Welcome");
    };
  });

const { name } = useOutletContext<OuletContext>()[0];

  return (
    <>
      <PopUpMenu />
      <div className="full-container">name is:{name}</div>
    </>
  );
}
