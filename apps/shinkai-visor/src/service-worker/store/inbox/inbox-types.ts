import { AsyncData } from "../helpers/async-data";

export type Inbox = {
  id: string;
};

export interface InboxState {
  all: AsyncData<Inbox[]>,
}
