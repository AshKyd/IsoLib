import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import resolve from "vite-plugin-resolve";

export default defineConfig({
  plugins: [
    resolve({
      raf: `
        export default function raf(){}
      `,
    }),
    preact(),
  ],
  server: {
    host: "0.0.0.0",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
});
