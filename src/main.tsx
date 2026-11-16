import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import "./styles/globals.css";
import "./styles/living-room.css";
import "./styles/reference.css";
import "./styles/focus.css";
import "./styles/palettes.css";
import "./styles/settings.css";
import "./styles/features.css";
import "./styles/personal.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
