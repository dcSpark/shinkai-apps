import common from './locales/en/common.json';
import errors from './locales/en/errors.json';

const resources = {
  common,
  errors,
} as const;

export type Resources = typeof resources;
export default resources;
