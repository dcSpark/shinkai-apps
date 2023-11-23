/** @type {import('tailwindcss').Config} */
const tailwindTypography = require('@tailwindcss/typography');
const tailwindAnimate = require('tailwindcss-animate');
const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  content: [],
  darkMode: ['class'],

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
        secondary: {
          600: '#19242D',
        },
        foreground: '#FFFFFF',
        'muted-foreground': '#c7c7c7',
        // TODO: remove visor
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
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
          '0%, 100%': { transform: 'opacity: 1' },
          '50%': { transform: 'opacity: .5' },
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        breath: 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;',
        'big-bounce': 'big-bounce 1s infinite',
      },
    },
  },
  plugins: [tailwindAnimate, tailwindTypography],
};
