import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.getElementsByTagName("html")[0].setAttribute("data-bs-theme", "dark");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
