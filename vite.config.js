import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/formify/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          /* Async paths (lazy/dynamic imports) chunk separately — smaller initial JS */
          if (id.includes("exceljs")) return "exceljs";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("@dnd-kit")) return "dnd";
        },
      },
    },
    chunkSizeWarningLimit: 650,
  },
});
