import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef5ff",
          100: "#d9e6ff",
          200: "#b0c8ff",
          300: "#86a9ff",
          400: "#5d8bff",
          500: "#346cff",
          600: "#1d54e6",
          700: "#153fad",
          800: "#0e2a73",
          900: "#07153a"
        }
      }
    }
  },
  plugins: []
};

export default config;
