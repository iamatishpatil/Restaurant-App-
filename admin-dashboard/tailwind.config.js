/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff4d4d",
        secondary: "#333",
        accent: "#f9a825",
      },
    },
  },
  plugins: [],
}
