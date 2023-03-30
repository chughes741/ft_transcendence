import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RootView } from "./views/root.view";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <>
    <style>
      @import
      url('https://fonts.googleapis.com/css2?family=Raleway&display=swap');
    </style>
    <React.StrictMode>
      <RootView/>
    </React.StrictMode>
  </>
);
