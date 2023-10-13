import { defineManifest } from '@crxjs/vite-plugin'

import baseManifestJson from './public/manifest.json';


const getVersion = () => {
  const version = process.env.VERSION || baseManifestJson.version || '0.0.0.0';
  const [major, minor, patch, label = '0'] = version
    .replace(/[^\d.-]+/g, '')
    .split(/[.-]/);
  return `${major}.${minor}.${patch}.${label}`;
};

export const dynamicManifest = defineManifest((env) => {
  return {
    ...baseManifestJson,
    version: getVersion(),
  };
});
