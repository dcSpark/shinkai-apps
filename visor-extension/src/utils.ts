import moonIcon from './icons/type-moon.svg';
import planetIcon from './icons/type-planet.svg';
import starIcon from './icons/type-star.svg';
import galaxyIcon from './icons/type-galaxy.svg';
import cometIcon from './icons/type-comet.svg';

export function processName(shipName: string): string {
  if (shipName.length > 30) {
    return `${shipName.substring(0, 6)}_${shipName.slice(-6)}`;
  } else {
    return shipName;
  }
}

export function whatShip(shipName: string): string {
  if (shipName.length > 30) return 'comet';
  if (shipName.length > 14) return 'moon';
  if (shipName.length > 7) return 'planet';
  if (shipName.length > 4) return 'star';
  else return 'galaxy';
}

export const permDescriptions = {
  shipName: 'The name (@p) of your Agrihan ship/identity.',
  shipURL: 'The URL of your running Agrihan ship.',
  scry: 'Reads data from your Agrihan ship.',
  poke: 'Sends data to your Agrihan ship.',
  thread: 'Issues spider threads in your Agrihan ship.',
  subscribe: 'Reads a continuous stream of data from your Agrihan ship.',
};

export function getIcon(patp: string) {
  switch (whatShip(patp)) {
    case 'comet':
      return cometIcon;
    case 'planet':
      return planetIcon;
    case 'star':
      return starIcon;
    case 'galaxy':
      return galaxyIcon;
    case 'moon':
      return moonIcon;
  }
}

export function cite(ship: string): string {
  let patp = ship,
    shortened = '';
  if (patp === null || patp === '') {
    return '';
  }
  if (patp.startsWith('~')) {
    patp = patp.substr(1);
  }
  // comet
  if (patp.length === 56) {
    shortened = '~' + patp.slice(0, 6) + '_' + patp.slice(50, 56);
    return shortened;
  }
  // moon
  if (patp.length === 27) {
    shortened = '~' + patp.slice(14, 20) + '^' + patp.slice(21, 27);
    return shortened;
  }
  return `~${patp}`;
}
