import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [tailwindcss(), solid()],
  server: {
    port: 3000,
    proxy: {
      "/api/console": {
        target: "http://localhost:8332",
        ws: true,
      },
      "/api": {
        target: "http://localhost:8332",
      },
    },
  },
});
