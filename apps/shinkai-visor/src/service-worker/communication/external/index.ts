import { OPEN_SIDEPANEL_DELAY_MS } from '../../action';
import { ACTIONS_MAP } from './actions';
import {
  ServiceWorkerExternalMessage,
  ServiceWorkerExternalMessageResponse,
  ServiceWorkerExternalMessageResponseStatus,
} from './types';

const GLOBALLY_ALLOWED_ORIGINS: RegExp[] = [
  /shinkai\.com$/,
  /develop\.shinkai-website\.pages\.dev$/,
  ...(import.meta.env.DEV ? [/localhost/, /typescriptlang/] : []),
];
const originIsGloballyAllowed = (origin: string): boolean =>
  GLOBALLY_ALLOWED_ORIGINS.some((globallyAllowedOrigin) =>
    globallyAllowedOrigin.test(origin),
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
          message: `origin:"${sender.origin}" is not allowed`,
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
          message: `permission:${action.permission} for origin:"${sender.origin}" not found`,
        });
      }

      const validationResult = action.validator.safeParse(message.payload);
      if (!validationResult.success) {
        const flatErrors = validationResult.error.flatten();
        const errorMessage = Object.entries(flatErrors.fieldErrors)
          .map(([field, errors]) => {
            return `${field}:[${errors?.join(', ')}]`;
          })
          .join('\n');
        return sendResponse({
          status: ServiceWorkerExternalMessageResponseStatus.BadRequest,
          message: `invalid message payload errors:\n${errorMessage}`,
          errors: flatErrors.fieldErrors,
        });
      }

      // Execute action
      try {
        // check if action needs to open sidepanel to add a delay
        if (action.openSidePanel) {
          await chrome.sidePanel.open({ windowId: sender.tab?.windowId });
          // add a delay to allow the sidepanel to open first
          setTimeout(async () => {
            const responsePayload = await action.resolver(
              message.payload,
              sender.tab?.id as number,
            );
            return sendResponse({
              status: ServiceWorkerExternalMessageResponseStatus.Success,
              payload: responsePayload,
            });
          }, OPEN_SIDEPANEL_DELAY_MS);
        }

        const responsePayload = await action.resolver(
          message.payload,
          sender.tab.id,
        );
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
