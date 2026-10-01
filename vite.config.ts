import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Fallback used when NAP_API_TARGET is absent from the environment.
// Keep in sync with VITE_API_BASE_URL in .env / .env.example.
const RAILWAY_API_TARGET = "https://backend-production-b8c2b.up.railway.app";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv is required here: process.env does not yet contain .env values
  // while this config file is being evaluated.
  const env = loadEnv(mode, process.cwd(), "");

  // Target for the `/api` dev proxy. Same host as VITE_API_BASE_URL so that
  // dev and production resolve identically. Override with NAP_API_TARGET in
  // .env (or the shell) to point at a locally running backend.
  const apiTarget = env.NAP_API_TARGET || RAILWAY_API_TARGET;

  return {
    server: {
      host: "::",
      port: 5174,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
