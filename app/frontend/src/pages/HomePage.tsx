import { useEffect } from "react";
import "src/pages/HomePage.tsx.css";

export default function HomePage() {
  useEffect(() => {
    document.body.classList.add("Welcome");
    return () => {
      document.body.classList.remove("Welcome");
    };
  });

  return (
    <>
      <div className="full-container"></div>
    </>
  );
}
