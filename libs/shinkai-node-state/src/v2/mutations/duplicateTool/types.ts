import { type Token } from "@shinkai_network/shinkai-message-ts/api/general/types";
import { type DuplicateToolResponse } from "@shinkai_network/shinkai-message-ts/api/tools/types";

export type DuplicateToolInput = Token & {
  nodeAddress: string;
  toolKey: string;
};

export type DuplicateToolOutput = DuplicateToolResponse;
