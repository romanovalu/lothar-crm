import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F5",
        foreground: "#111111",
        lothar: {
          yellow: "#F5D21F",
          black: "#111111",
          gray: "#F5F5F5",
          white: "#FFFFFF"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))"
      },
      boxShadow: {
        panel: "0 12px 40px rgba(17, 17, 17, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
