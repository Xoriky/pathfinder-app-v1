import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error(
    "[Pathfinder] Could not find #root element. " +
    "Check that index.html contains <div id=\"root\"></div>."
  );
}

createRoot(container).render(
  // StrictMode intentionally left ON during development.
  // It double-invokes effects and renders to surface bugs early.
  // It has zero impact on the production build.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
