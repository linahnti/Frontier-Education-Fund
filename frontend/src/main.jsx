import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ProfileProvider } from "./contexts/ProfileContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </ThemeProvider>
  </StrictMode>
);
