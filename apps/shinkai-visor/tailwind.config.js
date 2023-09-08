/** @type {import('tailwindcss').Config} */

const { join } = require('path');
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [join(__dirname, "./src/**/*.tsx"), join(__dirname, "./src/**/*.html"), join(__dirname, "./src/**/*.css")],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter-Regular', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'spin-slow': 'spin 6s linear infinite',
      },
      colors: {
        primary: {
          DEFAULT: '#FE6162',
          50: '#ffe8e8',
          100: '#ffbaba',
          200: '#fe8c8d',
          300: '#fe5e5f',
          400: '#fe3031',
          500: '#fd0203',
          600: '#cf0103',
          700: '#a10102',
          800: '#730101',
          900: '#450001',
          950: '#450001',
        },
        background: '#faf0e6',
      },
      transitionProperty: {
        'height': 'height'
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
