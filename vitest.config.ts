import path from "node:path";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Duas cópias do solid-js quebram contexto e reatividade entre elas, em silêncio.
    dedupe: ["solid-js", "solid-js/web", "solid-js/store"],
    // Sem isto o vitest resolve o runtime de servidor do Solid e nada renderiza.
    conditions: ["development", "browser"],
  },
  test: {
    // Sem isto o vitest resolve as dependências pela condição de servidor e o
    // `solid-js` acaba carregado duas vezes — contexto e reatividade param de
    // atravessar a fronteira, sem erro nenhum.
    server: { deps: { inline: [/solid-js/, /@solidjs/, /@ark-ui/, /solid-sonner/, /phosphor-solid/] } },
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
