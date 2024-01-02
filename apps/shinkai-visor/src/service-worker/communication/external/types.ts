import { SerializedAgent, SmartInbox } from '@shinkai_network/shinkai-message-ts/models';
import { ZodSchema } from "zod";

export enum ServiceWorkerExternalMessageType {
  InstallToolkit = 'install-toolkit',
  IsNodePristine = 'is-node-pristine',
  QuickConnectionIntent = 'quick-connection-intent',
  GetProfileAgents = 'get-profile-agents',
  GetProfileInboxes = 'get-profile-inboxes',
}

export interface BaseServiceWorkerExternalMessage<
  T extends ServiceWorkerExternalMessageType,
> {
  type: T;
}
export interface BaseServiceWorkerExternalMessageResponse<
  T extends ServiceWorkerExternalMessageType,
> {
  type: T;
}

export interface ServiceWorkerExternalMessageInstallToolkit
  extends BaseServiceWorkerExternalMessage<ServiceWorkerExternalMessageType.InstallToolkit> {
  payload: {
    toolkit: {
      toolkitName: string;
      version: string;
      cover: string;
    };
    url: string;
  };
}
export interface ServiceWorkerExternalMessageInstallToolkitResponse
  extends BaseServiceWorkerExternalMessageResponse<ServiceWorkerExternalMessageType.InstallToolkit> {}

export interface ServiceWorkerExternalMessageIsNodePristine
  extends BaseServiceWorkerExternalMessage<ServiceWorkerExternalMessageType.IsNodePristine> {
  payload: {
    nodeAddress: string;
  };
}
export interface ServiceWorkerExternalMessageIsNodePristineResponse
  extends BaseServiceWorkerExternalMessageResponse<ServiceWorkerExternalMessageType.IsNodePristine> {
  payload: {
    isPristine: boolean;
  };
}

export interface ServiceWorkerExternalMessageGetProfileAgents
  extends BaseServiceWorkerExternalMessage<ServiceWorkerExternalMessageType.GetProfileAgents> {}
export interface ServiceWorkerExternalMessageGetProfileAgentsResponse
  extends BaseServiceWorkerExternalMessageResponse<ServiceWorkerExternalMessageType.GetProfileAgents> {
  payload: {
    agents: SerializedAgent[];
  };
}

export interface ServiceWorkerExternalMessageGetProfileInboxes
  extends BaseServiceWorkerExternalMessage<ServiceWorkerExternalMessageType.GetProfileInboxes> {}
export interface ServiceWorkerExternalMessageGetProfileInboxesResponse
  extends BaseServiceWorkerExternalMessageResponse<ServiceWorkerExternalMessageType.GetProfileInboxes> {
  payload: {
    inboxes: SmartInbox[];
  };
}

export interface ServiceWorkerExternalMessageQuickConnectionIntent
  extends BaseServiceWorkerExternalMessage<ServiceWorkerExternalMessageType.QuickConnectionIntent> {
  payload: {
    nodeAddress: string;
  };
}
export interface ServiceWorkerExternalMessageQuickConnectionIntentResponse
  extends BaseServiceWorkerExternalMessageResponse<ServiceWorkerExternalMessageType.QuickConnectionIntent> {}

export type ServiceWorkerExternalMessage =
  | ServiceWorkerExternalMessageInstallToolkit
  | ServiceWorkerExternalMessageIsNodePristine
  | ServiceWorkerExternalMessageQuickConnectionIntent;

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
}
export interface ServiceWorkerExternalMessageResponseError {
  status: ServiceWorkerExternalMessageResponseStatus.Error;
  message: string;
}
export type ServiceWorkerExternalMessageResponsePayload =
  ServiceWorkerExternalMessageIsNodePristineResponse;

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

// TODO: Improve this tipification
export type ServiceWorkerExternalMessageResolver = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any,
  tabId: number,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export type ServiceWorkerExternalMessageActionsMap = {
  [Key in ServiceWorkerExternalMessageType]?: {
    permission: string;
    resolver: ServiceWorkerExternalMessageResolver;
    validator: ZodSchema,
  };
};
