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
    /**
     * `solid` é o que faz diferença: bibliotecas como o Ark publicam o JSX cru nessa
     * condição, para o plugin do consumidor compilar. Sem ela vem o `default`, que já
     * está compilado com o runtime dentro — e aí existem dois Solid, que não enxergam o
     * contexto um do outro.
     */
    conditions: ["solid", "development", "browser"],
  },
  test: {
    // Sem isto o vitest resolve as dependências pela condição de servidor e o
    // `solid-js` acaba carregado duas vezes — contexto e reatividade param de
    // atravessar a fronteira, sem erro nenhum.
    server: { deps: { inline: true } },
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
