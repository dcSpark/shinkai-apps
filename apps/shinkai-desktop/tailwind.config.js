/** @type {import('tailwindcss').Config} */

const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const sharedTailwindConfig = require('../../libs/shinkai-ui/src/shinkai-preset.js');

module.exports = {
  presets: [sharedTailwindConfig],
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html,css}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};
