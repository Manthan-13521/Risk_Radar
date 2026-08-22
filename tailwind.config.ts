import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rr: {
          bg: '#ECE6E2',
          surface: '#E0D8D4',
          surface2: '#D3C9C5',
          border: '#C4B5B0',
          text: '#111111',
          muted: '#554B49',
          red: '#990011',
          'red-dark': '#76000D',
          'red-hover': '#B30018',
          safe: '#176B52',
          warn: '#B86A00',
        },
      },
    },
  },
  plugins: [],
};
export default config;
