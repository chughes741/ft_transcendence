import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import WelcomePage from "./pages/WelcomePage";
import Root, { rootLoader } from "./routes/root";
import GameTest from "./pages/GameTest";

const router = createBrowserRouter([
  {
    element: <Root />,
    path: "/",
    loader: rootLoader,
    children: [
      { path: "", element: <WelcomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "gametest", element: <GameTest /> }
    ]
  }
]);

export default router;
