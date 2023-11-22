import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';
import { SmartInbox } from '@shinkai_network/shinkai-message-ts/models';
import { UndefinedInitialDataOptions } from '@tanstack/react-query/src/queryOptions';

export type GetInboxesInput = CredentialsPayload & {
  sender: string;
  receiver: string;
  senderSubidentity: string;
  targetShinkaiNameProfile: string;
};
export type GetInboxesOutput = SmartInbox[];

export type Options = UndefinedInitialDataOptions<GetInboxesOutput>;
