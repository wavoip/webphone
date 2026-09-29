import path from "node:path";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Sem isto o vitest resolve o runtime de servidor do Solid e nada renderiza.
    conditions: ["development", "browser"],
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
