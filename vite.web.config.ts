import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true, tsconfigPath: "./tsconfig.app.json", rollupTypes: true })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: "src/index.tsx",
      name: "wavoipWebphone",
      formats: ["es", "umd"],
      fileName: (format) => {
        return `index.${format}.js`;
      },
    },
    emptyOutDir: true,
    rollupOptions: {
      external: [],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
