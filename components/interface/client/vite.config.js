import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

const inContainer = fs.existsSync("/.dockerenv");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: inContainer
          ? "http://interface-api:3030"
          : "http://localhost:3030",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
