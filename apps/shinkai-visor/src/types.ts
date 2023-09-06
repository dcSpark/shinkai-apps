import Shinkai from '@urbit/http-api';
import { Scry, Thread, Poke, SubscriptionRequestInterface } from '@urbit/http-api/dist/types';

// LLM
export type DecryptedLLMCredentials = {
  llmName: string;
  uniqueId: string;
  llmURL: string;
  privateKey: string | undefined;
}

export type EncryptedLLMCredentials = {
  llmName: string;
  uniqueId: string;
  encryptedLlmURL: string;
  encryptedPrivateKey: string | undefined;
}

// Urbit
export type DecryptedShipCredentials = {
  shipName: string;
  shipURL: string;
  shipCode: string;
};

export type EncryptedShipCredentials = {
  shipName: string;
  encryptedShipURL: string;
  encryptedShipCode: string;
};

export type Permission = 'shipName' | 'shipURL' | 'scry' | 'thread' | 'poke' | 'subscribe';

export type TabID = number;
export type ExtensionID = string;
export type PopupPreference = 'modal' | 'window';

export interface VisorSubscription {
  subscription: SubscriptionRequestInterface;
  subscriber: TabID | ExtensionID;
  airlockID: number;
  requestID: string;
}

export interface ShinkaiVisorConsumerTab {
  tab: TabID;
  url: URL;
}

export interface ShinkaiVisorConsumerExtension {
  id: ExtensionID;
  name: string;
  tabs?: TabID[];
}

export interface PermissionsGraph {
  [key: string]: Permission[];
}

type Website = string;

export interface PermissionRequest {
  key: Website | ExtensionID;
  name?: string;
  permissions: Permission[];
  existing?: Permission[];
}

export interface ShinkaiVisorState {
  airlock: Shinkai;
  first: boolean;
  ships: EncryptedShipCredentials[];
  llms: EncryptedLLMCredentials[];
  cached_url: string;
  cached_creds: EncryptedShipCredentials;
  popupPreference: PopupPreference;
  requestedPerms: PermissionRequest;
  selectedShip: EncryptedShipCredentials;
  selectedLLM: EncryptedLLMCredentials;
  activeShip: EncryptedShipCredentials;
  activeLLM: EncryptedLLMCredentials;
  permissions: PermissionsGraph;
  consumer_tabs: Array<ShinkaiVisorConsumerTab>;
  consumer_extensions: ShinkaiVisorConsumerExtension[];
  activeSubscriptions: VisorSubscription[];
  commandHistory: { command: string; arguments: string[] }[];
  init: () => Promise<void>;
  setMasterPassword: (password: string) => Promise<void>;
  addShip: (ship: string, url: string, code: string, pw: string) => Promise<void>;
  addLLM: (llmName: string, uniqueId: string, llmURL: string, pk: string | undefined, pw: string) => Promise<void>;
  cacheURL: (url: string) => void;
  cacheCreds: (creds: EncryptedShipCredentials) => void;
  removeShip: (ship: EncryptedShipCredentials) => Promise<void>;
  removeLLM: (llm: EncryptedLLMCredentials) => Promise<void>;
  selectShip: (ship: EncryptedShipCredentials) => void;
  selectLLM: (llm: EncryptedLLMCredentials) => void;
  connectShip: (url: string, ship: EncryptedShipCredentials) => Promise<any>;
  disconnectShip: () => void;
  requestPerms: (request: PermissionRequest) => void;
  grantPerms: (perms: PermissionRequest) => Promise<void>;
  denyPerms: () => void;
  removeWholeDomain: (url: string, ship: string, domain: string) => Promise<void>;
  revokePerm: (url: string, ship: string, perms: PermissionRequest) => Promise<void>;
  loadPerms: (permissions: PermissionsGraph) => void;
  changePopupPreference: (preference: PopupPreference) => Promise<void>;
  changeMasterPassword: (oldPassword: string, newPassword: string) => Promise<void>;
  resetApp: () => Promise<void>;
  addConsumerTab: (consumer: ShinkaiVisorConsumerTab) => void;
  addConsumerExtension: (consumer: ShinkaiVisorConsumerExtension) => void;
  addSubscription: (sub: VisorSubscription) => void;
  removeSubscription: (sub: VisorSubscription) => void;
  storeCommandHistory: (command: { command: string; arguments: string[] }) => void;
}
export interface PermissionRequest {
  key: Website | ExtensionID;
  name?: string;
  permissions: Permission[];
  existing?: Permission[];
}

export type ShinkaiVisorAction =
  | 'on'
  | 'check_connection'
  | 'check_perms'
  | 'shipURL'
  | 'perms'
  | 'shipName'
  | 'scry'
  | 'poke'
  | 'subscribe'
  | 'subscribeOnce'
  | 'unsubscribe'
  | 'thread';
export type ShinkaiVisorInternalAction =
  | 'state'
  | 'connected'
  | 'cache_form_url'
  | 'end_url_caching'
  | 'dismiss_perms';
type ShinkaiVisorRequestType =
  | Scry
  | Thread<any>
  | Poke<any>
  | SubscriptionRequestInterface
  | ShinkaiVisorAction[];

export interface ShinkaiVisorRequest {
  app: 'shinkaiVisor';
  action: ShinkaiVisorAction;
  data?: ShinkaiVisorRequestType;
}
export interface CommandLauncherRequest {
  app: 'command-launcher';
  action: string;
  data?: any;
}
export interface ShinkaiVisorResponse {
  id: string;
  status: 'locked' | 'noperms' | 'ok';
  response?: any;
  error?: any;
}

export interface ShinkaiVisorInternalComms {
  action: ShinkaiVisorInternalAction | string;
  data?: any;
}

export interface ShinkaiVisorEvent {
  action: ShinkaiVisorEventType;
  requestID?: string;
  data?: any;
}
export type ShinkaiVisorEventType = ShinkaiVisorInternalEvent | ShinkaiEvent;

type ShinkaiVisorInternalEvent =
  | 'connected'
  | 'disconnected'
  | 'permissions_granted'
  | 'permissions_revoked';
type ShinkaiEvent = 'sse' | 'poke_success' | 'poke_error' | 'subscription_error';

export interface PermissionGraph {
  [key: string]: {
    permissions: Permission[];
  };
}

type ShinkaiAction = 'scry' | 'thread' | 'poke' | 'subscribe';
