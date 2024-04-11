import { useGetAvailableSharedItems } from '@shinkai_network/shinkai-node-state/lib/queries/getAvailableSharedItems/useGetAvailableSharedItems';
import { Button } from '@shinkai_network/shinkai-ui';
import React from 'react';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';

const PublicItemsSubscription = () => {
  const auth = useAuth((state) => state.auth);

  const { data: sharedItems } = useGetAvailableSharedItems({
    nodeAddress: auth?.node_address,
    shinkaiIdentity: auth?.shinkai_identity,
    profile: auth?.profile,
    my_device_encryption_sk: auth?.my_device_encryption_sk,
    my_device_identity_sk: auth?.my_device_identity_sk,
    node_encryption_pk: auth?.node_encryption_pk,
    profile_encryption_sk: auth?.profile_encryption_sk,
    profile_identity_sk: auth?.profile_identity_sk,
  });

  return (
    <div>
      <Header title={'Shared Items'} />
      <div className="w-full divide-y divide-gray-300 py-4">
        {sharedItems?.map((folder) => (
          <div
            className="flex items-center justify-between gap-2 py-2.5"
            key={folder.path}
          >
            <div className="space-y-1">
              <span className="line-clamp-1 text-base font-medium capitalize">
                {folder.path.replace(/\//g, '')}
              </span>
              <div className="text-gray-80 flex items-center gap-3 text-xs">
                <span>
                  {folder.subscription_requirement.is_free ? 'Free' : 'Paid'}{' '}
                </span>{' '}
                ⋅{' '}
                <span>
                  {folder.subscription_requirement.minimum_token_delegation} KAI
                </span>
                ⋅{' '}
                <span>
                  {folder.subscription_requirement.monthly_payment.USD} USD
                </span>
              </div>
            </div>
            <Button className="bg-gray-300 py-1.5 text-sm" size="auto">
              Subscribe
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicItemsSubscription;
