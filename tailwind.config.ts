import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0d12",
        paper: "#f7f5ef",
        accent: "#ff5a3c",
        accent2: "#3cffb0",
      },
      fontFamily: {
        display: ['"Inter"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
