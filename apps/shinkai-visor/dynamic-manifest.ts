import { defineManifest } from '@crxjs/vite-plugin';

import baseManifestJson from './public/manifest.json';

const getVersion = () => {
  const version = process.env.VERSION || baseManifestJson.version || '0.0.0.1';
  const [major, minor, patch, label = '0'] = version
    .replace(/[^\d.-]+/g, '')
    .split(/[.-]/);
  return `${major}.${minor}.${patch}.${label}`;
};

const getName = () => {
  return `${process.env.NAME_PREFIX || ''}${baseManifestJson.name}`;
};

const getDescription = () => {
  return `${process.env.DESCRIPTION_PREFIX || ''}${
    baseManifestJson.description
  }`;
};

const getPublicKey = () => {
  return (
    process.env.PUBLIC_KEY ||
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgdEOqEQpJXJIfmVTNW9NELXqA4yE2WoGo6C7ssQSW9oWiGugLRyUp1EeZ1xQSMaIN08yppKkn49QrTDo73/myuxP94LJ/vZN4rVuEYkzWUfKEv4bSABPkUkhNygddf22iXvfKpQkMzLnmXiKetS6k0NYDoz5GT8oVO2HxmQOgCJpX7wq6W0SzntqmUp5zN2FEh6rcZd20evL1HpxBA4ZylWmiS3n2pMfzCoR37YYaUlwE8Og+6RtuZIR3XaBKo7g3AG4vPi+TO5Jk4hjybYHtA38fBn6Gc5LEahywnJcoLTTSHEQ4hvylHgvlC9RpI8p121cRSmK2ycTuKpVBoRKMwIDAQAB'
  );
};

export const dynamicManifest = defineManifest((env) => {
  return {
    ...baseManifestJson,
    version: getVersion(),
    name: getName(),
    description: getDescription(),
    key: getPublicKey(),
  };
});
