import { useGetMySubscriptions } from '@shinkai_network/shinkai-node-state/lib/queries/getMySubscriptions/useGetMySubscriptions';
import { Button } from '@shinkai_network/shinkai-ui';
import React from 'react';

import { useAuth } from '../../store/auth/auth';

const Subscription = () => {
  const auth = useAuth((state) => state.auth);

  const { data: subscriptions } = useGetMySubscriptions({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  return (
    <div>
      <h1>My Subscription</h1>
      <div className="divide-y divide-gray-300">
        {subscriptions?.map((subscription) => (
          <div
            className="flex items-center justify-between gap-2 py-2.5"
            key={subscription.subscription_id.unique_id}
          >
            <div className="space-y-1">
              <span className="line-clamp-1 text-base font-medium capitalize">
                {subscription.shared_folder.replace(/\//g, '')}
              </span>
              <div className="text-gray-80 flex items-center gap-1 text-xs">
                <span>{subscription.subscriber_node} </span>⋅{' '}
                <span>{subscription.payment} </span>
              </div>
            </div>
            <Button
              className="bg-gray-300 py-1.5 text-sm"
              onClick={async () => {
                if (!auth) return;
              }}
              size="auto"
            >
              Unsubscribe
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
