import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "#09090B",
        surface: {
          DEFAULT: "#121215",
          muted: "#18181B",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(255, 255, 255, 0.05)",
        },
        liquidity: {
          DEFAULT: "#10B981",
          hover: "#059669",
          glow: "rgba(16, 185, 129, 0.25)",
        },
        leak: {
          DEFAULT: "#F43F5E",
          glow: "rgba(244, 63, 94, 0.25)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          glow: "rgba(245, 158, 11, 0.2)",
        },
        accent: {
          indigo: "#6366F1",
          violet: "#8B5CF6",
          cyan: "#06B6D4",
        },
        text: {
          primary: "#FAFAFA",
          muted: "#A1A1AA",
          dim: "#71717A",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        "emerald-glow": "0 0 25px -5px rgba(16, 185, 129, 0.3)",
        "rose-glow": "0 0 25px -5px rgba(244, 63, 94, 0.3)",
        "card": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
