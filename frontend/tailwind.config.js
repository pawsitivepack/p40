/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          maroon: {
            700: '#800000',  // Maroon color
            600: '#990000',  // Lighter maroon for hover
          },
        },
      },
    },
    plugins: [],
  }
  