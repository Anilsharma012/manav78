import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handler
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found");
} else {
  createRoot(rootElement).render(<App />);
}
