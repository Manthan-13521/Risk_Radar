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
          bg: '#FCF6F5',
          surface: '#F0E8E6',
          surface2: '#E7DEDC',
          border: '#D5C8C5',
          text: '#111111',
          muted: '#6F6664',
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
