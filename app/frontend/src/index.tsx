import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <>
    <style>
      @import
      url('https://fonts.googleapis.com/css2?family=Raleway&display=swap');
    </style>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </>
);
