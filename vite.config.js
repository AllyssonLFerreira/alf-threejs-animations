import { defineConfig } from "vite";

export default defineConfig({
  root: "demo",
  server: {
    open: "/test.html"
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true
  }
});