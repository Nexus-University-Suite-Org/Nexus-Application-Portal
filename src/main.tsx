import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installDebugFetch } from "./lib/debugLogger";
import { unregisterStaleServiceWorkers } from "./lib/serviceWorkerCleanup";

// Installed before the app renders so every fetch is captured, including
// those in modules that hard-code /api/v1/... literals.
installDebugFetch();

// Clears a service worker another project left registered on the shared dev
// origin, which otherwise intercepts navigations for this app.
unregisterStaleServiceWorkers();

createRoot(document.getElementById("root")!).render(<App />);