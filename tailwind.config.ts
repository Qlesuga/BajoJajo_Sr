import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import { heroui } from "@heroui/react";

export default {
  content: [
    "./src/**/*.tsx",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      keyframes: {
        marquee: {
          "0%, 20%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        marquee: "marquee 10s linear infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
} satisfies Config;
