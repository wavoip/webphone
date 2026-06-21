import { createRequire } from "node:module";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const require = createRequire(import.meta.url);
const pkg = require("./package.json") as { version: string };

// WEBPHONE_VERSION_OVERRIDE lets the POC pretend to be an older
// published version so the auto-update path can be exercised locally.
const version = process.env.WEBPHONE_VERSION_OVERRIDE ?? pkg.version;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ insertTypesEntry: true, tsconfigPath: "./tsconfig.app.json", rollupTypes: true }),
  ],
  define: {
    __WEBPHONE_VERSION__: JSON.stringify(version),
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
