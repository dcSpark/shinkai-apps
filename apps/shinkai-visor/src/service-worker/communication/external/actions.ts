import { z } from 'zod';

import {
  getProfileAgentsResolver,
  getProfileInboxes,
  isNodePristineResolver,
  quickConnectionIntent,
} from './resolvers';
import {
  ServiceWorkerExternalMessageActionsMap,
  ServiceWorkerExternalMessageType,
} from './types';

export const ACTIONS_MAP: ServiceWorkerExternalMessageActionsMap = {
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
  [ServiceWorkerExternalMessageType.InstallToolkit]: {
    permission: '',
    resolver: () => { throw new Error('NYI') },
    validator: z.undefined().or(z.object({})),
  }
};
