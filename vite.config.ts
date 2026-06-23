import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

const root = resolve(__dirname, "src");

export default defineConfig({
  build: {
    manifest: true,
  },
  plugins: [react()],
  server: {
    cors: true,
    port: 3000,
    origin: "http://localhost:3000",
    hmr: {
      port: 3000,
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
      },
      "/cctv-proxy": {
        target: "http://127.0.0.1:1984",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cctv-proxy/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": root, // This maps "@" to "src/"
      pages: resolve(root, "pages"),
      components: resolve(root, "components"),
      lib: resolve(root, "lib"), // For "@/lib/utils"
    },
  },
});