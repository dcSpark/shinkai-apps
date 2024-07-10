import { getSubscriptionNotifications as getSusbcriptionNotificionAPI } from '@shinkai_network/shinkai-message-ts/api';

import {
  GetSubscriptionNotificationsInput,
  GetSubscriptionNotificationsOutput,
} from './types';

export const getSubscriptionNotifications = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetSubscriptionNotificationsInput): Promise<GetSubscriptionNotificationsOutput> => {
  const response = await getSusbcriptionNotificionAPI(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
  return response.data;
};
