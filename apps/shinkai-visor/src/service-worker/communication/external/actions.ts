import { z } from 'zod';

import {
  exportConnectionIntentResolver,
  getProfileAgentsResolver,
  getProfileInboxes,
  isInstalledResolver,
  isNodeConnectedResolver,
  isNodePristineResolver,
  quickConnectionIntent,
} from './resolvers';
import {
  ServiceWorkerExternalMessageActionsMap,
  ServiceWorkerExternalMessageType,
} from './types';

export const ACTIONS_MAP: ServiceWorkerExternalMessageActionsMap = {
  [ServiceWorkerExternalMessageType.IsInstalled]: {
    permission: '',
    resolver: isInstalledResolver,
    validator: z.void(),
  },
  [ServiceWorkerExternalMessageType.IsNodePristine]: {
    permission: 'node-is-pristine',
    resolver: isNodePristineResolver,
    validator: z.object({
      nodeAddress: z.string().url(),
    }),
  },
  [ServiceWorkerExternalMessageType.IsNodeConnected]: {
    permission: 'node-is-connected',
    resolver: isNodeConnectedResolver,
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
    openSidePanel: true,
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
    resolver: () => {
      throw new Error('NYI');
    },
    validator: z.undefined().or(z.object({})),
  },
  [ServiceWorkerExternalMessageType.ExportConnectionIntent]: {
    permission: 'export-connection-intent',
    resolver: exportConnectionIntentResolver,
    validator: z.void(),
    openSidePanel: true,
  },
};
