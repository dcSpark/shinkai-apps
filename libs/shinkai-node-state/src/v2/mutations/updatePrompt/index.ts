import { updatePrompt as updatePromptApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type UpdatePromptInput } from './types';

export const updatePrompt = async ({
  nodeAddress,
  token,
  promptName,
  promptContent,
  isPromptFavorite,
  isPromptEnabled,
  isPromptSystem,
  promptVersion,
  id,
}: UpdatePromptInput) => {
  return await updatePromptApi(nodeAddress, token, {
    is_favorite: isPromptFavorite,
    name: promptName,
    prompt: promptContent,
    is_enabled: isPromptEnabled,
    is_system: isPromptSystem,
    version: promptVersion,
    rowid: id,
  });
};
