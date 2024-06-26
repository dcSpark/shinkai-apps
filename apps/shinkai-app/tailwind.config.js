/** @type {import('tailwindcss').Config} */
const { join } = require('path');

module.exports = {
  // darkMode: ["class"],
  content: [
    join(__dirname, './src/**/*.tsx'),
    join(__dirname, './src/**/*.html'),
    join(__dirname, './src/**/*.css'),
  ],
  theme: {
    container: {
      center: true,
      padding: ['1rem', '1.5rem', '2rem'],
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      backgroundImage: {
        hero: 'url("https://shinkai.com/assets/bg-hero.webp")',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        newake: ['Newake', 'sans-serif'],
      },
      colors: {
        primary: 'var(--ion-color-primary)',
        secondary: 'var(--ion-color-secondary)',
        brand: {
          200: '#FFD9D9',
          400: '#FE6062',
          500: '#FE6162',
          600: '#FE5153',
        },
        accent: 'rgb(9, 9, 11)',
        muted: 'rgb(114, 113, 122)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
