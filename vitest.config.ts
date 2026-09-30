import path from "node:path";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      /**
       * O `phosphor-solid` não declara `exports` e o `main` dele é CJS, que faz
       * `require("solid-js")` e carrega um segundo Solid — os dois param de enxergar o
       * contexto um do outro e as máquinas do Ark nunca abrem. Os builds de produção
       * pegam o `module` sozinhos; só o vitest precisa disto. Some quando os SVGs forem
       * inlinados (DEV-544).
       */
      "phosphor-solid": path.resolve(__dirname, "./node_modules/phosphor-solid/dist/index.esm.js"),
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
