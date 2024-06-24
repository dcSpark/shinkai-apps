import {
  LLMProvider,
  SmartInbox,
} from '@shinkai_network/shinkai-message-ts/models';
import { ZodSchema } from 'zod';

import { ACTIONS_MAP } from './actions';

export enum ServiceWorkerExternalMessageType {
  IsInstalled = 'is-installed',
  InstallToolkit = 'install-toolkit',
  IsNodePristine = 'is-node-pristine',
  IsNodeConnected = 'is-node-connected',
  QuickConnectionIntent = 'quick-connection-intent',
  GetProfileAgents = 'get-profile-agents',
  GetProfileInboxes = 'get-profile-inboxes',
  ExportConnectionIntent = 'export-connection-intent',
}

export type BaseServiceWorkerExternalMessage = {
  type: ServiceWorkerExternalMessageType;
  payload: Parameters<
    (typeof ACTIONS_MAP)[ServiceWorkerExternalMessageType]['resolver']
  >[0];
};
export type BaseServiceWorkerExternalMessageResponse = {
  type: ServiceWorkerExternalMessageType;
  payload: ReturnType<
    (typeof ACTIONS_MAP)[ServiceWorkerExternalMessageType]['resolver']
  >;
};

export interface ServiceWorkerExternalMessageInstallToolkit {
  toolkit: {
    toolkitName: string;
    version: string;
    cover: string;
  };
  url: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceWorkerExternalMessageInstallToolkitResponse {}

export interface ServiceWorkerExternalMessageIsNodePristine {
  nodeAddress: string;
}

export interface ServiceWorkerExternalMessageIsNodePristineResponse {
  isPristine: boolean;
}

export type ServiceWorkerExternalMessageGetProfileAgents = never;

export interface ServiceWorkerExternalMessageGetProfileAgentsResponse {
  agents: LLMProvider[];
}

export type ServiceWorkerExternalMessageGetProfileInboxes = never;

export interface ServiceWorkerExternalMessageGetProfileInboxesResponse {
  inboxes: SmartInbox[];
}

export interface ServiceWorkerExternalMessageQuickConnectionIntent {
  nodeAddress: string;
  tabId: number;
}

export type ServiceWorkerExternalMessageQuickConnectionIntentResponse = void;

export type ServiceWorkerExternalMessageIsInstalledResponse = {
  isInstalled: true;
  version: string;
};

export interface ServiceWorkerExternalMessageIsConnected {
  nodeAddress: string;
}

export type ServiceWorkerExternalMessageIsConnectedResponse = {
  isNodeConnected: boolean;
};

export type ServiceWorkerExternalMessageExportConnectionIntentResponse = void;

export type ServiceWorkerExternalMessage = BaseServiceWorkerExternalMessage;

export enum ServiceWorkerExternalMessageResponseStatus {
  Unauthorized = 'unauthorized',
  Forbidden = 'forbidden',
  BadRequest = 'bad-request',
  Error = 'error',
  Success = 'success',
}

export interface ServiceWorkerExternalMessageResponseUnauthorized {
  status: ServiceWorkerExternalMessageResponseStatus.Unauthorized;
  message: string;
}

export interface ServiceWorkerExternalMessageResponseForbidden {
  status: ServiceWorkerExternalMessageResponseStatus.Forbidden;
  message: string;
}

export interface ServiceWorkerExternalMessageResponseBadRequest {
  status: ServiceWorkerExternalMessageResponseStatus.BadRequest;
  message: string;
  errors: { [field: string]: string[] | undefined };
}

export interface ServiceWorkerExternalMessageResponseError {
  status: ServiceWorkerExternalMessageResponseStatus.Error;
  message: string;
}

export type ServiceWorkerExternalMessageResponsePayload = ReturnType<
  (typeof ACTIONS_MAP)[ServiceWorkerExternalMessageType]['resolver']
>;

export interface ServiceWorkerExternalMessageResponseSuccess {
  status: ServiceWorkerExternalMessageResponseStatus.Success;
  payload: ServiceWorkerExternalMessageResponsePayload;
}

export type ServiceWorkerExternalMessageResponse =
  | ServiceWorkerExternalMessageResponseUnauthorized
  | ServiceWorkerExternalMessageResponseForbidden
  | ServiceWorkerExternalMessageResponseBadRequest
  | ServiceWorkerExternalMessageResponseError
  | ServiceWorkerExternalMessageResponseSuccess;

export type ServiceWorkerExternalMessageResolver = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  tabId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export type ServiceWorkerExternalMessageActionsMap = {
  [Key in ServiceWorkerExternalMessageType]: {
    permission: string;
    resolver: ServiceWorkerExternalMessageResolver;
    validator: ZodSchema;
    openSidePanel?: boolean;
  };
};
