import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const darkModeMatcher = window.matchMedia("(prefers-color-scheme: dark)");

if (darkModeMatcher.matches) {
  document
    .getElementsByTagName("html")[0]
    .setAttribute("data-bs-theme", "dark");
}

darkModeMatcher.addEventListener("change", (event) => {
  if (event.matches) {
    document
      .getElementsByTagName("html")[0]
      .setAttribute("data-bs-theme", "dark");
  } else {
    document
      .getElementsByTagName("html")[0]
      .setAttribute("data-bs-theme", "light");
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
