import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import WelcomePage from "./pages/WelcomePage";
import ChatTest from "./pages/ChatTest";
import GameTest from "./pages/GameTest"
import Home, { rootLoader } from "./routes/root";

const router = createBrowserRouter([
  {
    element: <Home />,
    path: "/",
    loader: rootLoader,
    children: [
      {
        element: <LoginPage/>,
        path: "/login",
      },
      {
        element: <WelcomePage/>,
        path: "*"
      },
      {
        element: <GameTest/>,
        path: "/gametest"
      },
      {
        element: <ChatTest/>,
        path: "/chattest"
      }
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
