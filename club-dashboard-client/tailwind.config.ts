import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          base: "#103044",
          surface: "#0b2432",
          panel: "#17384d",
          text: "#f5f1e8",
          muted: "#c7d2d9",
          accent: "#e7c65c",
          border: "#5f7480",
        },
      },
    },
  },
  plugins: [],
};

export default config;