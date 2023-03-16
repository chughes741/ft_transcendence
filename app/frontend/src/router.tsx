import { createBrowserRouter } from "react-router-dom";
import Root, { rootLoader } from "./routes/root";
import Chat from "./routes/chat";
import Home from "./routes/home";
import Login from "./routes/login";
import Game from "./routes/game";
import Profile from "./routes/profile";

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
