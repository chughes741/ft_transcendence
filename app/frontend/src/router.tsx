import { createBrowserRouter } from "react-router-dom";
import Root, { rootLoader } from "./routes/RootRoute";
import Chat from "./routes/ChatRoute";
import Home from "./routes/HomeRoute";
import Login from "./routes/LoginRoute";
import Game from "./routes/GameRoute";
import Profile from "./routes/ProfileRoute";

const router = createBrowserRouter([
  {
    element: <Root />,
    path: "/",
    loader: rootLoader,
    children: [
      { path: "", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "gametest", element: <Game /> },
      { path: "profile", element: <Profile /> },
      { path: "chat", element: <Chat /> }
    ]
  }
]);

export default router;
