import { useEffect } from "react";
import "src/pages/ProfilePage.tsx.css";
import { useOutletContext } from "react-router-dom";
import SideBar from "src/components/SideBar";

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
      <SideBar />
    </>
  );
}
