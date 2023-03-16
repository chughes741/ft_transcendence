import { createBrowserRouter } from "react-router-dom";
import RootRoute, { rootLoader } from "./routes/RootRoute";
import HomeRoute from "./routes/HomeRoute";
import LoginRoute from "./routes/LoginRoute";
import GameRoute from "./routes/GameRoute";
import ProfileRoute from "./routes/ProfileRoute";
import ChatRoute from "./routes/ChatRoute";

const router = createBrowserRouter([
  {
    element: <RootRoute />,
    path: "/",
    loader: rootLoader,
    children: [
      { path: "", element: <HomeRoute /> },
      { path: "login", element: <LoginRoute /> },
      { path: "game", element: <GameRoute /> },
      { path: "profile", element: <ProfileRoute /> },
      { path: "chat", element: <ChatRoute /> }
    ]
  }
]);

export default router;
