import { z } from 'zod';

import { getProfileAgentsResolver, getProfileInboxes, isNodePristineResolver, quickConnectionIntent } from './resolvers';
import {
  ServiceWorkerExternalMessage,
  ServiceWorkerExternalMessageActionsMap,
  ServiceWorkerExternalMessageResponse,
  ServiceWorkerExternalMessageResponseStatus,
  ServiceWorkerExternalMessageType,
} from './types';

const GLOBALLY_ALLOWED_ORIGINS: RegExp[] = [
  /.*\.shinkai\.com/,
  ...(import.meta.env.DEV ? [/localhost/, /typescriptlang\.org/] : []),
];
const originIsGloballyAllowed = (origin: string): boolean =>
  GLOBALLY_ALLOWED_ORIGINS.some((globallyAllowedOrigin) =>
    origin.match(globallyAllowedOrigin),
  );
const originIsAllowed = (origin: string): boolean => {
  // Implements specific auth. IE control permissions o
  return false;
};
const originHasPermission = (origin: string): boolean => {
  return true;
};
const authenticate = (origin: string): boolean => {
  const isAuthenticated =
    originIsGloballyAllowed(origin ?? '') || originIsAllowed(origin);
  if (!isAuthenticated) {
    // TODO: Implemented authentication workflow
  }
  return isAuthenticated;
};
const authorize = (origin: string): boolean => {
  const isAuthorized =
    originIsGloballyAllowed(origin ?? '') || originHasPermission(origin);
  if (!isAuthorized) {
    // TODO: Implemented authorization workflow
  }
  return isAuthorized;
};

const ACTIONS_MAP: ServiceWorkerExternalMessageActionsMap = {
  [ServiceWorkerExternalMessageType.IsNodePristine]: {
    permission: 'node-is-pristine',
    resolver: isNodePristineResolver,
    validator: z.object({
      nodeAddress: z.string().url(),
    }),
  },
  [ServiceWorkerExternalMessageType.QuickConnectionIntent]: {
    permission: 'visor-connect',
    resolver: quickConnectionIntent,
    validator: z.object({
      nodeAddress: z.string().url(),
    }),
  },
  [ServiceWorkerExternalMessageType.GetProfileAgents]: {
    permission: 'agent-list',
    resolver: getProfileAgentsResolver,
    validator: z.undefined().or(z.object({})),
  },
  [ServiceWorkerExternalMessageType.GetProfileInboxes]: {
    permission: 'inbox-list',
    resolver: getProfileInboxes,
    validator: z.undefined().or(z.object({})),
  },
};

export const listen = (): void => {
  chrome.runtime.onMessageExternal.addListener(
    async (
      message: ServiceWorkerExternalMessage,
      sender,
      sendResponse: (payload: ServiceWorkerExternalMessageResponse) => void,
    ) => {
      console.log('sw onMessage external', message, sender);
      if (!sender.origin || !sender.tab?.id) {
        return;
      }
      // Authentication layer
      const isAuthenticated = authenticate(sender.origin);
      if (!isAuthenticated) {
        return sendResponse({
          status: ServiceWorkerExternalMessageResponseStatus.Unauthorized,
          message: `origin:${sender.origin} is not allowed`,
        });
      }

      const action = ACTIONS_MAP[message.type];

      if (!action) {
        return sendResponse({
          status: ServiceWorkerExternalMessageResponseStatus.Error,
          message: `unknown action ${message.type}`,
        });
      }

      const isAuthorized = authorize(sender.origin);
      if (!isAuthorized) {
        return sendResponse({
          status: ServiceWorkerExternalMessageResponseStatus.Forbidden,
          message: `permission:${action.permission} for origin:${sender.origin} not found`,
        });
      }

      const validationResult = action.validator.safeParse(message.payload);
      if (!validationResult.success) {
        return sendResponse({
          status: ServiceWorkerExternalMessageResponseStatus.BadRequest,
          message: `invalid message payload for origin:${sender.origin} errors:${validationResult.error.flatten().formErrors.join('\n')}`,
        });
      }

      // Execute action
      try {
        const responsePayload = await action.resolver(message, sender.tab?.id);
        return sendResponse({
          status: ServiceWorkerExternalMessageResponseStatus.Success,
          payload: responsePayload,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.log('unhandled error execution action', e);
        return sendResponse({
          status: ServiceWorkerExternalMessageResponseStatus.Error,
          message: `unhandled error execution action ${e?.message}`,
        });
      }
    },
  );
};
