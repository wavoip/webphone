/** @type {import('tailwindcss').Config} */
export default {
  prefix: "wv", // 👈 aqui o prefixo real
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
    screens: {
      // --- MOBILE-FIRST (min-width) ---
      sm: "640px", // Smartphones grandes (ex: iPhone Plus, Galaxy S)
      md: "768px", // Tablets (iPad, Galaxy Tab)
      lg: "1024px", // Notebooks pequenos
      xl: "1280px", // Notebooks médios / monitores Full HD
      "2xl": "1536px", // Monitores grandes

      // --- MOBILE-FIRST (max-width) ---
      "max-sm": { max: "639px" },
      "max-md": { max: "767px" },
      "max-lg": { max: "1023px" },
      "max-xl": { max: "1279px" },
      "max-2xl": { max: "1535px" },
    },
  },
  plugins: [],
  css: {
    allowedExternalDependencies: ["sooner"],
  },
};
