import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // @ points to src folder
    },
  },
  server: {
    host: "localhost",
    port: 5173,
    open: false,
    fs: {
      strict: false, // Allows importing files outside project root if needed
    },
  },
  preview: {
    port: 5173,
  },
  base: "/",
  optimizeDeps: {
    include: [], // Add dependencies here if needed for faster dev
  },
  build: {
    outDir: "dist", // Output folder for production build
  },
});
