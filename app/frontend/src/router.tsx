import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import WelcomePage from "./pages/WelcomePage";
import Root, { rootLoader } from "./routes/root";
import GameTest from "./pages/GameTest";
import Chat from "./routes/chat";

const router = createBrowserRouter([
  {
    /** @todo should it be RootPage? */
    element: <Root />,
    path: "/",
    loader: rootLoader,
    children: [
      /** @todo change to HomePage? */
      { path: "", element: <WelcomePage /> },
      /** @todo change to LoginPopUp? or child of HomePage */
      { path: "login", element: <LoginPage /> },
      /** @todo change to game/lobby page */
      { path: "gametest", element: <GameTest /> },
      /** @todo add profile page */
      // { path: "profile", element: <ProfilePage /> }
      /** @todo add chat page */
      { path: "chat", element: <Chat /> }
    ]
  }
]);

//  /chat/:chatroomid


export default router;
