/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdfbf7',
          100: '#faf6f0',
          200: '#f2e8d9',
          300: '#e4d0b9',
          400: '#cdaa86',
          500: '#b87d4b', // Caramel
          600: '#9b6438',
          700: '#7d4a27',
          800: '#5e3219',
          900: '#3d1d0c', // Dark chocolate
          950: '#1b0e06', // Espresso
        },
        brand: {
          blue: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            950: '#075985',
          },
          pink: {
            50: '#fdf2f8',
            100: '#fce7f3',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
          },
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
          },
          yellow: {
            50: '#fefce8',
            100: '#fef9c3',
            500: '#eab308',
            600: '#ca8a04',
            700: '#a16207',
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
