import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { MotionConfig } from "framer-motion";
import App from "./App";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <GlobalErrorBoundary>
          <App />
        </GlobalErrorBoundary>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
