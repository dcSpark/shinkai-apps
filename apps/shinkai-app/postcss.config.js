import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

export default {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {
      config: join(dirname(__filename), 'tailwind.config.js'),
    },
    autoprefixer: {},
  },
};
