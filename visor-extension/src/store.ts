import { ShinkaiVisorState, EncryptedShipCredentials } from './types';
import {
  getStorage,
  initStorage,
  storeCredentials,
  removeShip,
  setPopupPreference,
  reEncryptAll,
  savePassword,
  resetApp,
  storeCommandHistory,
  storeLLMCredentials,
  removeLLM,
} from './storage';
import { connectToShip, grantPerms, deleteDomain, revokePerms, fetchAllPerms } from './shinkai';
import create from 'zustand';

export const useStore = create<ShinkaiVisorState>((set, get) => ({
  airlock: null,
  first: true,
  ships: [],
  llms: [],
  cached_url: '',
  cached_creds: null,
  popupPreference: 'modal',
  requestedPerms: null,
  selectedShip: null,
  selectedLLM: null,
  activeShip: null,
  activeLLM: null,
  permissions: {},
  consumer_tabs: [],
  consumer_extensions: [],
  activeSubscriptions: [],
  commandHistory: [],
  init: async () => {
    const res = await getStorage(['popup', 'ships', 'llms', 'password', 'permissions', 'commandHistory']);
    set(state => ({
      first: !('password' in res),
      popupPreference: res.popup || 'modal',
      ships: res.ships || [],
      llms: res.llms || [],
      permissions: res.permissions || {},
      commandHistory: res.commandHistory || [],
    }));
  },
  setMasterPassword: async password => {
    const res = await initStorage(password);
    set(state => ({ first: false }));
  },
  addShip: async (ship, url, code, pw) => {
    const creds = await storeCredentials(ship, url, code, pw);
    const airlock = await connectToShip(url, creds);
    const perms = await fetchAllPerms(airlock.url);
    set(state => ({
      selectedShip: creds,
      activeShip: creds,
      airlock: airlock,
      permissions: perms.bucket,
    }));
  },
  addLLM: async (llmName, uniqueId, llmURL, pk, pw) => {
    const creds = await storeLLMCredentials(llmName, uniqueId, llmURL, pk, pw);
    set(state => ({
      selectedLLM: creds,
      activeLLM: creds,
    }));
  },
  cacheURL: (string: string) => set(state => ({ cached_url: string })),
  cacheCreds: (creds: EncryptedShipCredentials) => set(state => ({ cached_creds: creds })),
  removeShip: async ship => {
    const active = get().activeShip;
    if (active?.shipName === ship.shipName) {
      const airlock = (get() as any).airlock;
      airlock.reset();
      const ships = await removeShip(ship);
      set(state => ({ ships: ships, activeShip: null, airlock: null, activeSubscriptions: [] }));
    } else {
      const ships = await removeShip(ship);
      set(state => {
        ships: ships;
      });
    }
  },
  removeLLM: async llm => {
    const active = get().activeLLM;
    if (active?.llmName === llm.llmName) {
      const airlock = (get() as any).airlock;
      airlock.reset();
      const llms = await removeLLM(llm);
      set(state => ({ llms: llms, activeLLM: null, airlock: null, activeSubscriptions: [] }));
    } else {
      const llms = await removeLLM(llm);
      set(state => {
        llms: llms;
      });
    }
  },
  selectShip: ship => set(state => ({ selectedShip: ship })),
  selectLLM: llm => set(state => ({ selectedLLM: llm })),
  connectShip: async (url, ship) => {
    const airlock = await connectToShip(url, ship);
    const perms = await fetchAllPerms(airlock.url);
    // TODO some handling here...?
    set(state => ({ activeShip: ship, airlock: airlock, permissions: perms.bucket }));
  },
  disconnectShip: async () => {
    const airlock = (get() as any).airlock;
    airlock.reset();
    set(state => ({ activeShip: null, airlock: null, activeSubscriptions: [], permissions: {} }));
  },
  requestPerms: request => set(state => ({ requestedPerms: request })),
  grantPerms: async perms => {
    const airlock = (get() as any).airlock;
    await grantPerms(airlock, perms);
    const newperms = await fetchAllPerms(airlock.url);
    set(state => ({ requestedPerms: null, permissions: newperms.bucket }));
  },
  denyPerms: () => set(state => ({ requestedPerms: null })),
  removeWholeDomain: async (url, ship, domain) => {
    const res = await deleteDomain(url, ship, domain);
    const airlock = (get() as any).airlock;
    if (airlock) {
      const newperms = await fetchAllPerms(airlock.url);
      set(state => ({ requestedPerms: null, permissions: newperms.bucket }));
    } else set(state => ({ requestedPerms: null }));
  },
  revokePerm: async (url, ship, permRequest) => {
    const res = await revokePerms(url, ship, permRequest);
    const airlock = (get() as any).airlock;
    if (airlock) {
      const newperms = await fetchAllPerms(airlock.url);
      set(state => ({ requestedPerms: null, permissions: newperms.bucket }));
    } else set(state => ({ requestedPerms: null }));
  },
  loadPerms: (permissions: any) => {
    set(state => ({ permissions: permissions }));
  },
  changePopupPreference: async preference => {
    await setPopupPreference(preference);
    set(state => ({ popupPreference: preference }));
  },
  changeMasterPassword: async (oldPassword, password) => {
    await reEncryptAll(oldPassword, password);
    await savePassword(password);
  },
  resetApp: async () => {
    const active = get().activeShip;
    if (active) {
      const airlock = (get() as any).airlock;
      airlock.reset();
    }
    await resetApp();
    set(state => ({
      first: true,
      ships: [],
      llms: [],
      activeShip: null,
      activeLLM: null,
      airlock: null,
      activeSubscriptions: [],
    }));
  },
  addConsumerTab: newConsumer => {
    const match = get().consumer_tabs.find(consumer => newConsumer.tab == consumer.tab);
    if (!match) set(state => ({ consumer_tabs: [...state.consumer_tabs, newConsumer] }));
  },
  addConsumerExtension: newConsumer => {
    const match = get().consumer_extensions.find(consumer => newConsumer.id == consumer.id);
    if (!match)
      set(state => ({ consumer_extensions: [...state.consumer_extensions, newConsumer] }));
    else {
      const rest = get().consumer_extensions.filter(ext => ext.id !== match.id);
      const updated = {
        id: match.id,
        name: match.name,
        tabs: [...match.tabs, ...newConsumer.tabs],
      };
      set(state => ({ consumer_extensions: [...rest, updated] }));
    }
  },
  addSubscription: sub =>
    set(state => ({ activeSubscriptions: [...state.activeSubscriptions, sub] })),
  removeSubscription: subToDelete => {
    const filtered = get().activeSubscriptions.filter(sub => {
      return !(
        sub.airlockID === subToDelete.airlockID && sub.subscriber === subToDelete.subscriber
      );
    });
    set(state => ({ activeSubscriptions: filtered }));
  },
  storeCommandHistory: async command => {
    const history = await storeCommandHistory(command);
    const rest = get().commandHistory;
    set(state => ({ commandHistory: [history, ...rest] }));
  },
}));
