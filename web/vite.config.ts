import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8332",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
