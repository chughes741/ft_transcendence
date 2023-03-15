import { Routes, Route } from "react-router-dom";
import LoginPage from "src/pages/LoginPage";
import WelcomePage from "src/pages/WelcomePage";
import GameTest from "src/pages/GameTest";
import ChatTest from "src/pages/ChatTest";

const Views = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<WelcomePage />}
      />
      <Route
        path="/login"
        element={<LoginPage />}
      />
      <Route
        path="*"
        element={<WelcomePage />}
      />
      <Route
        path="/gametest"
        element={<GameTest />}
      />
      <Route
        path="/chattest"
        element={<ChatTest />}
      />
    </Routes>
  );
};

export default Views;
