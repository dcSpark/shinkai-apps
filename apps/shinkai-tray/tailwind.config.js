const sharedTailwindConfig = require('../../libs/shinkai-ui/src/shinkai-preset.js');

module.exports = {
  presets: [sharedTailwindConfig],
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
};
