import { readFileSync, writeFileSync } from 'node:fs';

import { consola } from 'consola';
import { colors } from 'consola/utils';

export const readJSON = (filePath: string) => {
  const data = readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const writeJSON = (filePath: string, data: any) => {
  const jsonStr = JSON.stringify(data, null, 2);
  writeFileSync(filePath, jsonStr, 'utf8');
};

export const tagWhite = (text: string) =>
  colors.bgWhiteBright(colors.black(` ${text} `));

export const divider = (name: string) => {
  consola.log('');
  consola.log(colors.gray(`${name}...`));
};
