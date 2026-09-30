import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import solid from "vite-plugin-solid";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * O modo PWA. Diferente do widget (`vite.config.ts`), aqui a página é nossa: o build é de
 * aplicação e não de biblioteca, o CSS sai em arquivo próprio, os sons viram requisições
 * que o service worker cacheia, e o `import()` do reamostrador vira chunk de verdade.
 *
 * Quem versiona é o service worker, então a auto-atualização por CDN do widget não existe
 * aqui — as duas brigariam pelo mesmo trabalho.
 */
export default defineConfig({
  root: path.resolve(__dirname, "src/shells/app"),
  publicDir: path.resolve(__dirname, "public"),
  plugins: [
    solid(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // O reamostrador passa de 2 MB e o teto padrão do workbox é 2 MiB: sem isto ele
      // fica de fora do precache e a primeira chamada offline falha.
      workbox: { globPatterns: ["**/*.{js,css,html,svg,png,mp3}"], maximumFileSizeToCacheInBytes: 4_000_000 },
      manifest: {
        name: "Wavoip Webphone",
        short_name: "Webphone",
        description: "Softphone da Wavoip: receba e faça chamadas de WhatsApp pelo navegador.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#1a1b1e",
        theme_color: "#16a34a",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  define: {
    __WEBPHONE_VERSION__: JSON.stringify(process.env.npm_package_version ?? "0.0.0"),
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
    // `solid` traz o JSX cru das bibliotecas para o nosso plugin compilar; sem ela vem
    // o pré-compilado, com um segundo runtime dentro.
    conditions: ["solid"],
    dedupe: ["solid-js", "solid-js/web", "solid-js/store"],
  },
  // Porta fixa, e diferente da do widget, para os dois rodarem juntos sem disputa.
  server: { host: "127.0.0.1", port: 5174, strictPort: true },
  preview: { host: "127.0.0.1", port: 4174, strictPort: true },
  build: {
    outDir: path.resolve(__dirname, "dist-app"),
    emptyOutDir: true,
    // O pacote npm já sai legível, então o mapa não esconde nada que o widget não mostre
    // — e sem ele o relatório de erro de quem usa o PWA aponta para código minificado.
    sourcemap: true,
  },
});
