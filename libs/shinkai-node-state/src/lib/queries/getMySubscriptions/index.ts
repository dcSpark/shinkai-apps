import { getMySubscriptions as getMySubscriptionsAPI } from '@shinkai_network/shinkai-message-ts/api';

import { GetMySubscriptionsInput, GetMySubscriptionsOutput } from './types';

export const getMySubscriptions = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetMySubscriptionsInput): Promise<GetMySubscriptionsOutput> => {
  const response = await getMySubscriptionsAPI(
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
