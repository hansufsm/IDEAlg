import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Space Mono", "ui-monospace", "monospace"],
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          bg: "#020817",
          surface: "#0d1a2e",
          border: "#1e3a5f",
          accent: "#00d4ff",
          accent2: "#ff6b35",
          muted: "#4a6080",
          text: "#e2eaf5",
          dim: "#7a9ab8",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        glow: "glow 3s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%,100%": { boxShadow: "0 0 10px rgba(0,212,255,0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(0,212,255,0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
