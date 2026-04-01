/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hall-bg': '#1e2a45',
        'hall-aisle': '#162035',
        'gold': '#c9a84c',
        'gold-light': '#e8c97a',
        'table-bg': '#e8e8e8',
        'table-border': '#b0b0b0',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
