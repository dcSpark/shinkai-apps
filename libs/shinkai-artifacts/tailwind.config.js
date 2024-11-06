const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,html,css}'],
  safelist: [
    {
      pattern: /.*/, // Matches all classes
    },
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1536px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(240 5.9% 90%)',
        input: 'hsl(240 5.9% 90%)',
        ring: 'hsl(240 5% 64.9%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(240 10% 3.9%)',
        primary: {
          DEFAULT: 'hsl(240 5.9% 10%)',
          foreground: 'hsl(0 0% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(240 4.8% 95.9%)',
          foreground: 'hsl(240 5.9% 10%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 72.22% 50.59% / <alpha-value>)',
          foreground: 'hsl(0 0% 98% / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(240 4.8% 95.9%)',
          foreground: 'hsl(240 3.8% 46.1%)',
        },
        accent: {
          DEFAULT: 'hsl(240 4.8% 95.9%)',
          foreground: 'hsl(240 5.9% 10%)',
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%))',
          foreground: 'hsl(240 10% 3.9%)',
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(240 10% 3.9%)',
        },
      },
      borderRadius: {
        xl: 'calc(0.5rem + 4px)',
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      fontFamily: {
        sans: [...fontFamily.sans],
        inter: ['Inter', ...fontFamily.sans],
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
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
