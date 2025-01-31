import config from '../config';

export const SHINKAI_STORE_URL = config.isDev
  ? 'http://localhost:3000'
  : import.meta.env.VITE_SHINKAI_STORE_URL || 'https://store.shinkai.com';
