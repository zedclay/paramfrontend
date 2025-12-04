/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          dark: '#004C99',
        },
        secondary: {
          DEFAULT: '#008B8B',
          light: '#20B2AA',
        },
        medical: {
          green: '#4CAF50',
        },
        text: {
          dark: '#2C3E50',
          medium: '#34495E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Montserrat', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

