import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';
import { SmartInbox } from '@shinkai_network/shinkai-message-ts/models';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

export type GetInboxesInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  receiver: string;
  senderSubidentity: string;
  targetShinkaiNameProfile: string;
};
export type GetInboxesOutput = SmartInbox[];
export type UseGetInboxes = [FunctionKey.GET_INBOXES, GetInboxesInput];

export type Options = QueryObserverOptions<
  GetInboxesOutput,
  Error,
  GetInboxesOutput,
  GetInboxesOutput,
  UseGetInboxes
>;
