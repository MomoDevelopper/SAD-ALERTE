import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sadred: "#d30000",
        sadbg: "#f8f9fa",
        sadblue: "#f0f4f8"
      }
    },
  },
  plugins: [],
} satisfies Config;

