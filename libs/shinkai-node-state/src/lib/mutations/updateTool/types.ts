import type {
  CredentialsPayload,
  ShinkaiTool,
  ShinkaiToolType,
} from '@shinkai_network/shinkai-message-ts/models';

export type UpdateToolOutput = {
  status: string;
};

export type UpdateToolInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  toolKey: string;
  toolType: ShinkaiToolType;
  toolPayload: ShinkaiTool;
  isToolEnabled: boolean;

  // workflowRaw: string;
  // workflowDescription: string;
};
