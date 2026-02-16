import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-dark)",
        foreground: "var(--text-primary)",
        "pokemon-red": "var(--pokemon-red)",
        "pokemon-blue": "var(--pokemon-blue)",
        "pokemon-cream": "var(--pokemon-cream)",
        "bg-card": "var(--bg-card)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "pokemon": "1rem",
        "pokemon-lg": "1.25rem",
      },
      boxShadow: {
        "card": "0 4px 20px -4px rgba(0, 0, 0, 0.35)",
        "glow": "0 0 24px -4px rgba(59, 130, 246, 0.15)",
        "inner-screen": "inset 0 2px 8px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
