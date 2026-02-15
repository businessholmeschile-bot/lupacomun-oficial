/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#222427",
        foreground: "#ffffff",
        card: "#2a2d31",
        primary: {
          DEFAULT: "#652BEB",
          hover: "#5824d3",
        },
        accent: {
          DEFAULT: "#30E89E",
          vibrant: "#EE6593",
        },
        industrial: {
          dark: "#1a1c1e",
          border: "rgba(255, 255, 255, 0.05)",
        }
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-space-grotesk)", "monospace"],
      },
    },
  },
  plugins: [],
};
