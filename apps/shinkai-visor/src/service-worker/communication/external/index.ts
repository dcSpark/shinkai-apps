import { isNodeAcceptingFirstConnectionResolver, quickConnectionIntent } from "./resolvers";
import { ServiceWorkerExternalMessage, ServiceWorkerExternalMessageActionsMap, ServiceWorkerExternalMessageResponse, ServiceWorkerExternalMessageResponseStatus, ServiceWorkerExternalMessageType } from "./types";

const GLOBALLY_ALLOWED_ORIGINS: RegExp[] = [/.*\.shinkai\.com/, ...(import.meta.env.DEV ? [/localhost/, /typescriptlang\.org/] : [])];
const isGloballyAllowed = (origin: string): boolean => GLOBALLY_ALLOWED_ORIGINS.some(globallyAllowedOrigin => origin.match(globallyAllowedOrigin));
const isSpecificallyAllowed = (origin: string): boolean => {
  // Implements specific auth. IE control permissions o
  return false;
}
const authenticate = (origin: string): boolean => {
  const isAuthenticated = isGloballyAllowed(origin ?? '') || isSpecificallyAllowed(origin);

  if (!isAuthenticated) {
    // TODO: Implemented auth workflow
  }

  return isAuthenticated;
}

const ACTIONS_MAP: ServiceWorkerExternalMessageActionsMap = {
  [ServiceWorkerExternalMessageType.IsNodeAcceptingFirstConnection]: {
    permissions: [],
    resolver: isNodeAcceptingFirstConnectionResolver,
  },
  [ServiceWorkerExternalMessageType.QuickConnectionIntent]: {
    permissions: [],
    resolver: quickConnectionIntent,
  },
};

export const listen = (): void => {
  chrome.runtime.onMessageExternal.addListener(async (message: ServiceWorkerExternalMessage, sender, sendResponse: (payload: ServiceWorkerExternalMessageResponse) => void) => {
    console.log('sw onMessage external', message, sender);
    if (!sender.origin || !sender.tab?.id) {
      return;
    }
    // Authentication layer
    const isAuthenticated = authenticate(sender.origin ?? '');
    if (!isAuthenticated) {
      return sendResponse({
        status: ServiceWorkerExternalMessageResponseStatus.Unauthorized,
      });
    }

    const action = ACTIONS_MAP[message.type];

    if (!action) {
      return sendResponse({
        status: ServiceWorkerExternalMessageResponseStatus.Error,
        message: `unknown action ${message.type}`,
      });
    }

    // TODO: Add Authorization layer
    // const isAuthorized = authorize(...);
    // if (!isAuthorized) {
    //   return sendResponse({
    //     status: ServiceWorkerExternalMessageResponseStatus.Forbidden,
    //   });
    // }

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
  });
}
