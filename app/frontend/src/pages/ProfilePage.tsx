import { useEffect } from "react";
import PopUpMenu from "src/popups/PopUpMenu";
import "ProfilePage.tsx.css";
import { useOutletContext } from "react-router-dom";
import PopUpChat from "src/popups/PopUpChat";

type OuletContext = {
  name: string;
};

export default function HomePage() {
  useEffect(() => {
    document.body.classList.add("Welcome");
    return () => {
      document.body.classList.remove("Welcome");
    };
  });

  const { name } = useOutletContext<OuletContext>();

  return (
    <>
      <PopUpMenu />
      <div className="full-container">name is:{name}</div>
      <PopUpChat />
    </>
  );
}
