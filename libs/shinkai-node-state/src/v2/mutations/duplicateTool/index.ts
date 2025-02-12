import { duplicateTool as duplicateToolApi } from "@shinkai_network/shinkai-message-ts/api/tools/index";

import { DuplicateToolInput, DuplicateToolOutput } from "./types";

export const duplicateTool = async ({
  nodeAddress,
  token,
  toolKey,
}: DuplicateToolInput): Promise<DuplicateToolOutput> => {
  return await duplicateToolApi(nodeAddress, token, { tool_key_path: toolKey });
};
