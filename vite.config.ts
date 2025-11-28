import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ insertTypesEntry: true, tsconfigPath: "./tsconfig.app.json", rollupTypes: true }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: false,
    lib: {
      entry: "src/index.tsx",
      name: "wavoipWebphone",
      formats: ["es", "umd"],
      fileName: (format) => {
        return `index.${format}.js`;
      },
    },
    rollupOptions: {
      external: [],
      plugins: [
        {
          name: "replace-process-env",
          transform(code) {
            return code.replace(/process\.env\.NODE_ENV/g, '"production"');
          },
        },
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    emptyOutDir: true,
  },
});
