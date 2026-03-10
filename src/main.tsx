import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { ThemeProvider } from "./context/ThemeContext";
import { ReaderProvider } from "./context/ReaderContext";
import { AuthProvider } from "./auth/AuthContext";
import { applyTheme, getStoredTheme } from "./services/theme/theme";
import "./styles/globals.css";
import "./styles/library.css";

applyTheme(getStoredTheme());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ReaderProvider>
          <App />
        </ReaderProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
