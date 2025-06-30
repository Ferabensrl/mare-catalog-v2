/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mare-nude': '#E3D4C1',
        'mare-brown': '#8F6A50'
      }
    },
  },
  plugins: [],
}
