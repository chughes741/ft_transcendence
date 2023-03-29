import { useEffect } from "react";
import "src/pages/HomePage.tsx.css";
import { useOutletContext } from "react-router-dom";
import SideBar from "src/components/SideBar";
import { Helmet } from "react-helmet";

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
      <Helmet>
        <title>King Pong | Welcome page</title>
      </Helmet>
      <div className="full-container">
        <SideBar />
      </div>
    </>
  );
}
