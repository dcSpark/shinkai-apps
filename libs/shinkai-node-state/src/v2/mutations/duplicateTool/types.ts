import { Token } from "@shinkai_network/shinkai-message-ts/api/general/types";
import { DuplicateToolResponse } from "@shinkai_network/shinkai-message-ts/api/tools/types";

export type DuplicateToolInput = Token & {
  nodeAddress: string;
  toolKey: string;
};

export type DuplicateToolOutput = DuplicateToolResponse;
