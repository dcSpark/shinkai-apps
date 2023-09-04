import Shinkai from '@urbit/http-api';
import { useStore } from './store';
import { EncryptedShipCredentials, PermissionRequest } from './types';

export async function fetchShipname(url: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(url.replace(/\/$/g, '') + '/who.json');
      const json = await res.json();
      resolve(json.who);
    } catch {
      reject('OTA outdated');
    }
  });
}

export async function scrapeShipname(url: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(url.replace(/\/$/g, '') + '/~/login');
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const ship = doc.querySelector('input').value.replace('~', '');
      resolve(ship);
    } catch {
      reject('OTA outdated');
    }
  });
}
export async function connectToShip(url: string, ship: EncryptedShipCredentials): Promise<any> {
  const { connectShip, activeSubscriptions } = useStore.getState();
  const airlock = new Shinkai(url, '');
  airlock.ship = ship.shipName;
  airlock.onError = async err => {
    airlock.reset();
    console.log(err, 'error');
    await connectShip(url, ship);
  };
  airlock.onRetry = () => console.log('');
  airlock.onOpen = () => console.log('');
  await airlock.poke({ app: 'hood', mark: 'helm-hi', json: 'opening airlock' });
  for (let sub of activeSubscriptions) await airlock.subscribe(sub.subscription);
  return airlock;
}

export async function loginToShip(url: string, code: string): Promise<any> {
  const controller = new AbortController();
  setTimeout(() => {
    controller.abort();
  }, 5000);
  const res = await fetch(url.replace(/\/$/g, '') + '/~/login', {
    body: `password=${code}`,
    method: 'POST',
    credentials: 'include',
    redirect: 'follow',
    signal: controller.signal,
  });
  return res;
}
export async function savePermission(permission: any): Promise<void> { }
export async function initPerms(shipName: string, url: string) {
  const airlock = new Shinkai(url, '');
  airlock.ship = shipName;
  try {
    const res = await fetchAllPerms(url);
    return grantPerms(airlock, {
      key: 'oadimaacghcacmfipakhadejgalcaepg',
      permissions: ['scry', 'poke', 'thread', 'subscribe', 'shipName', 'shipURL'],
      name: 'Shinkai Visor Command Launcher',
    });
  } catch {
    await setPerms(airlock);
    return grantPerms(airlock, {
      key: 'oadimaacghcacmfipakhadejgalcaepg',
      permissions: ['scry', 'poke', 'thread', 'subscribe', 'shipName', 'shipURL'],
      name: 'Shinkai Visor Command Launcher',
    });
  }
}
export async function setPerms(airlock: Shinkai) {
  const json = {
    'put-bucket': {
      desk: 'landscape',
      'bucket-key': 'shinkai-visor-permissions',
      bucket: {},
    },
  };
  return await airlock.poke({ app: 'settings-store', mark: 'settings-event', json: json });
}
export interface NewPermissionRequest {
  key: string;
  name?: string;
  permissions: string[];
  existing?: string[];
}
export async function grantPerms(airlock: Shinkai, perms: NewPermissionRequest) {
  // TODO: fix types at sv-core too
  let value;
  const existing = await checkPerms(airlock.url, perms.key);
  const set = new Set(existing);
  if (existing) {
    for (let p of perms.permissions) set.add(p);
    value = Array.from(set);
  } else {
    value = perms.permissions;
    if (perms.name) value.push(JSON.stringify({ extName: perms.name }));
  }

  const json = {
    'put-entry': {
      desk: 'landscape',
      'bucket-key': 'shinkai-visor-permissions',
      'entry-key': perms.key,
      value: value,
    },
  };
  return await airlock.poke({ app: 'settings-store', mark: 'settings-event', json: json });
}

export async function revokePerms(url: string, shipName: string, perms: PermissionRequest) {
  const airlock = new Shinkai(url, '');
  airlock.ship = shipName;
  let value;
  const existing = await checkPerms(url, perms.key);
  const set = new Set(existing);
  if (existing) {
    for (let p of perms.permissions) set.delete(p);
    value = Array.from(set);
  } else value = perms.permissions;

  const json = {
    'put-entry': {
      desk: 'landscape',
      'bucket-key': 'shinkai-visor-permissions',
      'entry-key': perms.key,
      value: value,
    },
  };
  const poke = await airlock.poke({ app: 'settings-store', mark: 'settings-event', json: json });
  airlock.reset();
  return poke;
}

export async function deleteDomain(url: string, ship: string, domain: string) {
  const airlock = new Shinkai(url, '');
  airlock.ship = ship;
  const json = {
    'del-entry': {
      desk: 'landscape',
      'bucket-key': 'shinkai-visor-permissions',
      'entry-key': domain,
    },
  };
  return await airlock.poke({ app: 'settings-store', mark: 'settings-event', json: json });
}

export async function checkPerms(url: string, domain: string) {
  const perms = await fetchAllPerms(url);
  const domainPerms = perms.bucket[domain];
  return await domainPerms;
}
export async function fetchAllPerms(url: string) {
  const airlock = new Shinkai(url, '');
  const payload = { app: 'settings-store', path: '/bucket/landscape/shinkai-visor-permissions' };
  const res = await airlock.scry(payload);
  airlock.reset();
  return res;
}

export async function wipeAllPerms(ship: string, url: string) {
  const airlock = new Shinkai(url, '');
  airlock.ship = ship;
  const json = {
    'del-bucket': {
      desk: 'landscape',
      'bucket-key': 'shinkai-visor-permissions',
    },
  };
  return await airlock.poke({ app: 'settings-store', mark: 'settings-event', json: json });
}

export async function openChannel(airlock: Shinkai) {
  await airlock.poke({ app: 'hood', mark: 'helm-hi', json: 'opening airlock' });
}
