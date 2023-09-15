import { ShinkaiMessage } from "@shinkai/shinkai-message-ts/models";

import { AsyncData } from "../helpers/async-data";

export type Inbox = {
  id: string;
};

export interface InboxState {
  all: AsyncData<Inbox[]>,
  create: AsyncData<{ inbox: Inbox }>,
  messages: {
    [inboxId: string]: AsyncData<ShinkaiMessage[]>,
  },
  messagesHashes: {
    [inboxId: string]: { [messageHask: string]: boolean },
  }
}
