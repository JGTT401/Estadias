/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0b5fff",
        bg: "#f7f7fb",
      },
    },
  },
  plugins: [],
};
