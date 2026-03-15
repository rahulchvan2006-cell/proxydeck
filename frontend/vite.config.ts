import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: false,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (Array.isArray(setCookie)) {
              proxyRes.headers["set-cookie"] = setCookie.map((c) =>
                c.replace(/;\s*Domain=[^;]+/i, "")
              );
            }
          });
        },
      },
    },
  },
});
