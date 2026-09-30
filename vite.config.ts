import { createRequire } from "node:module";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import solid from "vite-plugin-solid";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const require = createRequire(import.meta.url);
const pkg = require("./package.json") as { version: string };

// Para fingir uma versão publicada mais velha e exercitar a auto-atualização local.
const version = process.env.WEBPHONE_VERSION_OVERRIDE ?? pkg.version;

/**
 * O modo widget. A raiz é a casca, como no PWA (`vite.app.config.ts`): em
 * desenvolvimento o servidor entrega o `index.html` de lá — a página hospedeira de
 * mentira —, e no build a mesma pasta dá a entrada da biblioteca.
 */
export default defineConfig({
  root: path.resolve(__dirname, "src/shells/widget"),
  plugins: [
    solid(),
    tailwindcss(),
    // Só no build: gerar os tipos a cada start de servidor custa segundos e não serve a
    // ninguém em desenvolvimento.
    {
      // Caminhos absolutos: o plugin resolve a partir da raiz do Vite, que aqui é a casca.
      ...dts({
        insertTypesEntry: true,
        root: __dirname,
        tsconfigPath: path.resolve(__dirname, "tsconfig.app.json"),
        rollupTypes: true,
      }),
      apply: "build",
    },
  ],
  define: {
    __WEBPHONE_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // `solid` traz o JSX cru das bibliotecas para o nosso plugin compilar; sem ela vem
    // o pré-compilado, com um segundo runtime dentro.
    conditions: ["solid"],
    dedupe: ["solid-js", "solid-js/web", "solid-js/store"],
  },
  // Porta fixa, e diferente da do PWA, para os dois rodarem juntos sem disputa.
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "src/shells/widget/index.tsx"),
      name: "wavoipWebphone",
      formats: ["es", "umd"],
      fileName: (format) => {
        return `index.${format}.js`;
      },
    },
    rollupOptions: {
      external: [],
    },
    emptyOutDir: true,
  },
});
