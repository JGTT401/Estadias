import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // opcional: hmr.overlay: false si quieres ocultar overlay de errores
    // hmr: { overlay: false }
  },
});
