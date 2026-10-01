import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installDebugFetch } from "./lib/debugLogger";

// Installed before the app renders so every fetch is captured, including
// those in modules that hard-code /api/v1/... literals.
installDebugFetch();

createRoot(document.getElementById("root")!).render(<App />);