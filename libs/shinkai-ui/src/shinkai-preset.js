/** @type {import('tailwindcss').Config} */
const tailwindTypography = require('@tailwindcss/typography');
const tailwindAnimate = require('tailwindcss-animate');
const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [],
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      height: {
        input: '59px',
      },
      colors: {
        brand: {
          DEFAULT: 'hsla(360, 99%, 69%, 1)',
          500: 'hsla(359, 58%, 58%, 1)',
        },
        gray: {
          80: 'hsla(0, 0%, 69%, 1)',
          100: 'hsla(250, 7%, 51%, 1)',
          200: 'hsla(214, 5%, 25%, 1)',
          300: 'hsla(216, 5%, 20%, 1)',
          350: 'hsla(263, 7%, 24%, 1)',
          400: 'hsla(260, 7%, 18%, 1)',
          500: 'hsla(228, 7%, 14%, 1)',
        },
        red: {
          DEFAULT: 'hsla(0, 63%, 51%, 1)',
        },
        // TODO: remove tray
        primary: {
          600: '#FF7E7F',
          700: '#FF5E5F',
          800: '#FF3E3F',
        },
        secondary: {
          600: '#19242D',
        },
        foreground: '#FFFFFF',
        'muted-foreground': '#c7c7c7',
      },
      border: {
        input: 'hsl(var(--input))',
      },
      fontFamily: {
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
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
        breath: {
          from: { opacity: 1 },
          to: { opacity: 0.8 },
        },
        'big-bounce': {
          '0%, 100%': {
            transform: 'translateY(-75%)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        loaderDots: {
          '0%': {
            opacity: 1,
          },
          '50%, 100%': {
            opacity: 0.15,
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        breath: 'breath 5s ease-out infinite',
        'big-bounce': 'big-bounce 1s infinite',
      },
      zIndex: {
        max: 2147483647,
      },
    },
  },
  plugins: [
    tailwindAnimate,
    tailwindTypography,
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'translate-z': (value) => ({
            '--tw-translate-z': value,
            transform: ` translate3d(var(--tw-translate-x), var(--tw-translate-y), var(--tw-translate-z)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))`,
          }), // this is actual CSS
        },
        { values: theme('translate'), supportsNegativeValues: true },
      );
    }),
  ],
};
