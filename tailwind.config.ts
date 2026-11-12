import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F2EA",
        surface: "#FFFDFA",
        ink: "#202522",
        muted: "#555C56",
        gold: {
          DEFAULT: "#A28248",
          ink: "#725821",
        },
        border: "#DAD5CB",
        signature: "#17241F",
        "on-dark": "#FAF7F0",
        danger: "#A12F2F",
        success: "#23613D",
      },
      fontFamily: {
        "heading-ar": ["var(--font-noto-naskh)", "serif"],
        "body-ar": ["var(--font-ibm-plex)", "sans-serif"],
        "sans-en": ["var(--font-manrope)", "sans-serif"],
      },
      maxWidth: {
        "7xl": "80rem", // 1280px
      },
    },
  },
  plugins: [],
};

export default config;
