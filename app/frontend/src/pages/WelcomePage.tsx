import { useEffect } from "react";
import PopUpMenu from "../popups/PopUpMenu";
import "./WelcomePage.tsx.css";

export default function WelcomePage() {
  useEffect(() => {
    document.body.classList.add("Welcome");
    return () => {
      document.body.classList.remove("Welcome");
    };
  });

  return (
    <>
      <PopUpMenu id="popup" />
      <div className="full-container"></div>
    </>
  );
}
