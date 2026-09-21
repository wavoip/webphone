import { createRequire } from "node:module";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const require = createRequire(import.meta.url);
const pkg = require("./package.json") as { version: string };

// Para fingir uma versão publicada mais velha e exercitar a auto-atualização local.
const version = process.env.WEBPHONE_VERSION_OVERRIDE ?? pkg.version;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ insertTypesEntry: true, tsconfigPath: "./tsconfig.app.json", rollupTypes: true }),
  ],
  define: {
    __WEBPHONE_VERSION__: JSON.stringify(version),
    // React só troca para o build de produção quando `process.env.NODE_ENV` é
    // literal no bundle. Feito via `define` (e não por um plugin com hook
    // `transform`) porque um plugin que devolve string sem sourcemap invalida
    // o sourcemap do build inteiro.
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "127.0.0.1",
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
