import * as CryptoJS from 'crypto-js';
import { EncryptedShipCredentials, PopupPreference, PermissionsGraph } from './types';

interface Storage {
  ships?: EncryptedShipCredentials[];
  password?: string;
  popup?: PopupPreference;
  permissions?: PermissionsGraph;
  commandHistory?: { command: string; arguments: string[] }[];
}

export async function validate(password: string): Promise<boolean> {
  const res = await getStorage('password');
  const string = decrypt(res.password, password);
  if (string === 'agrihan_visor') return true;
  else return false;
}
export const getStorage = (key: string | string[]): Promise<Storage> =>
  new Promise((res, rej) =>
    chrome.storage.local.get(key, result => {
      if (chrome.runtime.lastError) rej(undefined);
      res(result);
    })
  );
export const setStorage = (item: { [key: string]: any }): Promise<any> =>
  new Promise((res, rej) =>
    chrome.storage.local.set(item, () => {
      if (chrome.runtime.lastError) rej(chrome.runtime.lastError);
      res(item);
    })
  );

// setters
export async function storeCredentials(
  ship: string,
  url: string,
  code: string,
  pw: string
): Promise<any> {
  const encryptedCredentials = encryptCreds(ship, url, code, pw);
  return saveShip(encryptedCredentials);
}

export function savePassword(password: string): Promise<any> {
  const encryptedString = encrypt('agrihan_visor', password);
  return setStorage({ password: encryptedString });
}

export function resetApp(): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) reject(undefined);
      resolve('ok');
    });
  });
}
export function setPopupPreference(preference: PopupPreference): Promise<any> {
  return setStorage({ popup: preference });
}

export async function initStorage(password: string): Promise<any> {
  await setPopupPreference('modal');
  return savePassword(password);
}

export async function removeShip(ship: EncryptedShipCredentials): Promise<any> {
  const res = await getStorage('ships');
  const new_ships = res['ships'].filter(
    (el: EncryptedShipCredentials) => el.shipName !== ship.shipName
  );
  return setStorage({ ships: new_ships });
}

async function saveShip(ship: EncryptedShipCredentials): Promise<EncryptedShipCredentials> {
  const res = await getStorage('ships');
  if (res['ships']?.length) {
    const ships = res['ships'];
    const filteredShips = ships.filter(sp => sp.shipName !== ship.shipName);
    const new_ships = [...filteredShips, ship];
    await setStorage({ ships: new_ships });
    return ship;
  } else {
    const new_ships = [ship];
    await setStorage({ ships: new_ships });
    return ship;
  }
}

export async function storeCommandHistory(command: {
  command: string;
  arguments: string[];
}): Promise<any> {
  const res = await getStorage('commandHistory');
  if (res['commandHistory']?.length) {
    const new_commands = [command, ...res['commandHistory']];
    if (res['commandHistory']?.length >= 50) new_commands.pop();
    await setStorage({ commandHistory: new_commands });
    return command;
  } else {
    const new_commands = [command];
    await setStorage({ commandHistory: new_commands });
    return command;
  }
}

// getters
export async function getShips(): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('ships', res => {
      if (res['ships'] && res['ships'].length) {
        resolve(res);
      } else {
        reject('data not set');
      }
    });
  });
}
export async function getPreference(): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('popup', res => {
      if (res['popup']) {
        resolve(res.popup);
      } else {
        reject('data not set');
      }
    });
  });
}

// encryption utils
export async function reEncryptAll(oldPassword: string, newPassword: string): Promise<void> {
  const ships = await getShips();
  for (const ship of ships.ships) {
    const newShip = reEncrypt(ship, oldPassword, newPassword);
    await saveShip(newShip);
  }
}

export function encryptCreds(
  ship: string,
  url: string,
  code: string,
  pw: string
): EncryptedShipCredentials {
  const encryptedURL = encrypt(url, pw).toString();
  const encryptedCode = encrypt(code, pw).toString();
  return {
    shipName: ship,
    encryptedShipURL: encryptedURL,
    encryptedShipCode: encryptedCode,
  };
}

function reEncrypt(
  ship: EncryptedShipCredentials,
  oldPassword: string,
  newPassword: string
): EncryptedShipCredentials {
  return {
    shipName: ship.shipName,
    encryptedShipURL: encrypt(decrypt(ship.encryptedShipURL, oldPassword), newPassword),
    encryptedShipCode: encrypt(decrypt(ship.encryptedShipCode, oldPassword), newPassword),
  };
}

export function encrypt(target: string, password: string): string {
  return CryptoJS.AES.encrypt(target, password).toString();
}
export function decrypt(target: string, password: string): string {
  if (password === '') return '';
  const decrypted = CryptoJS.AES.decrypt(target, password);
  try {
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}
