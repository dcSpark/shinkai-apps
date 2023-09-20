import { SerializedAgent } from "@shinkai_network/shinkai-message-ts/models";

import { AsyncData } from "../helpers/async-data";

export type Inbox = {
  id: string;
};

export interface AgentsState {
  agents: AsyncData<SerializedAgent[]>,
  add: AsyncData<{ agent: SerializedAgent }>,
}
