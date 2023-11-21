import { getAllInboxesForProfile } from '@shinkai_network/shinkai-message-ts/api';
import { SmartInbox } from '@shinkai_network/shinkai-message-ts/models/ShinkaiMessage';

import type { GetInboxesInput, GetInboxesOutput } from './types';

export const getInboxes = async ({
  receiver,
  senderSubidentity,
  sender,
  targetShinkaiNameProfile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetInboxesInput): Promise<GetInboxesOutput> => {
  const inboxes = await getAllInboxesForProfile(
    sender,
    senderSubidentity,
    receiver,
    targetShinkaiNameProfile,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
  return inboxes;
};
