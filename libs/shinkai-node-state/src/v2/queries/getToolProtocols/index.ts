import { getToolProtocols as getToolProtocolsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

export const getToolProtocols = async () => {
  const response = await getToolProtocolsApi();
  return response;
};
