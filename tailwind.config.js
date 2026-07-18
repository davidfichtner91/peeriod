/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        menstrual: '#dc2626',
        follicular: '#3b82f6',
        ovulation: '#a855f7',
        luteal: '#f59e0b',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
