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
          dark: "#1A3C2E",
          medium: "#2D6A4F",
          light: "#F0F7F4",
        },
        surface: {
          base: "#F8F6F1",
          card: "#F0F7F4",
        },
        ink: {
          primary: "#1A1A1A",
          secondary: "#6B7280",
        },
        border: {
          subtle: "#E5E7EB",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
