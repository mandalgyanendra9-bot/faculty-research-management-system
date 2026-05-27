/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9eeff",
          500: "#1d6fa3",
          600: "#165985",
          700: "#124669",
        },
        accent: {
          100: "#fef4dd",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(9, 30, 66, 0.12)",
      },
    },
  },
  plugins: [],
};
