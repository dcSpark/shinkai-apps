import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

export default {
  plugins: {
    tailwindcss: {
      config: join(dirname(__filename), 'tailwind.config.js'),
    },
    autoprefixer: {},
  },
}
