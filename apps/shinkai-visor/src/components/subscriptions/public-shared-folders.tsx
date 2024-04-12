import { useSubscribeToSharedFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/subscribeToSharedFolder/useSubscribeToSharedFolder';
import { useGetAvailableSharedItems } from '@shinkai_network/shinkai-node-state/lib/queries/getAvailableSharedItems/useGetAvailableSharedItems';
import { Button } from '@shinkai_network/shinkai-ui';
import React from 'react';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';

const PublicSharedFolderSubscription = () => {
  const auth = useAuth((state) => state.auth);

  const { data: sharedItems, isSuccess } = useGetAvailableSharedItems({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { mutateAsync: subscribeSharedFolder } = useSubscribeToSharedFolder();

  return (
    <div className="flex h-full flex-col gap-4">
      <Header title={'Browse Public Folders'} />
      {isSuccess && !Object.entries(sharedItems?.response || {}).length && (
        <p className="text-gray-80 text-left">
          There are no public folders available to subscribe to right now.
        </p>
      )}
      <div className="w-full divide-y divide-gray-300 py-4">
        {Object.entries(sharedItems?.response || {}).map(
          ([filename, fileDetails]) => (
            <div
              className="flex items-center justify-between gap-2 py-2.5"
              key={fileDetails.path}
            >
              <div className="space-y-1">
                <span className="line-clamp-1 text-base font-medium capitalize">
                  {filename.replace(/\//g, '')}
                </span>
                <div className="text-gray-80 flex items-center gap-3 text-xs">
                  <span>
                    {fileDetails.subscription_requirement.is_free
                      ? 'Free'
                      : 'Paid'}{' '}
                  </span>{' '}
                  ⋅{' '}
                  <span>
                    {
                      fileDetails.subscription_requirement
                        .minimum_token_delegation
                    }{' '}
                    KAI
                  </span>
                  ⋅{' '}
                  <span>
                    {fileDetails.subscription_requirement.monthly_payment.USD}{' '}
                    USD
                  </span>
                </div>
              </div>
              <Button
                className="bg-gray-300 py-1.5 text-sm"
                onClick={async () => {
                  if (!auth) return;
                  await subscribeSharedFolder({
                    nodeAddress: auth?.node_address,
                    shinkaiIdentity: auth?.shinkai_identity,
                    profile: auth?.profile,
                    folderPath: fileDetails.path,
                    my_device_encryption_sk: auth?.my_device_encryption_sk,
                    my_device_identity_sk: auth?.my_device_identity_sk,
                    node_encryption_pk: auth?.node_encryption_pk,
                    profile_encryption_sk: auth?.profile_encryption_sk,
                    profile_identity_sk: auth?.profile_identity_sk,
                  });
                }}
                size="auto"
              >
                Subscribe
              </Button>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default PublicSharedFolderSubscription;
