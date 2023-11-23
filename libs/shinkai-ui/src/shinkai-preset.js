/** @type {import('tailwindcss').Config} */
const tailwindTypography = require('@tailwindcss/typography');
const tailwindAnimate = require('tailwindcss-animate');
module.exports = {
  content: [],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },

    extend: {
      colors: {
        brand: {
          DEFAULT: 'hsla(360, 99%, 69%, 1)',
          500: 'hsla(359, 58%, 58%, 1)',
        },
        gray: {
          100: 'hsla(250, 7%, 51%, 1)',
          200: 'hsla(214, 5%, 25%, 1)',
          300: 'hsla(216, 5%, 20%, 1)',
          400: 'hsla(260, 7%, 18%, 1)',
          500: 'hsla(228, 7%, 14%, 1)',
        },
        red: {
          DEFAULT: 'hsla(0, 63%, 51%, 1)',
        },
        // TODO: remove
        primary: {
          600: '#FF7E7F',
          700: '#FF5E5F',
          800: '#FF3E3F',
        },
        foreground: '#FFFFFF',
        'muted-foreground': '#c7c7c7',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        newake: ['Newake', 'sans-serif'],
      },
      backgroundImage: {
        'app-gradient':
          'linear-gradient(90deg, rgba(0, 0, 0, 0.30) 0%, rgba(0, 0, 0, 0.20) 100%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindAnimate, tailwindTypography],
};
