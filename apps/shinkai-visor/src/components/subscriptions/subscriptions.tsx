import { useUnsubscribeToSharedFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/unsubscribeToSharedFolder/useUnsubscribeToSharedFolder';
import { useGetMySubscriptions } from '@shinkai_network/shinkai-node-state/lib/queries/getMySubscriptions/useGetMySubscriptions';
import { Button } from '@shinkai_network/shinkai-ui';
import { motion } from 'framer-motion';
import React from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';

const MotionButton = motion(Button);

const Subscription = () => {
  const auth = useAuth((state) => state.auth);

  const { data: subscriptions, isSuccess } = useGetMySubscriptions({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { mutateAsync: unsubscribeSharedFolder, isPending } =
    useUnsubscribeToSharedFolder({
      onSuccess: () => {
        toast.success('Subscription removed');
      },
      onError: (error) => {
        toast.error('Error removing subscription', {
          description: error.message,
        });
      },
    });

  return (
    <div className="flex h-full flex-col gap-4">
      {isSuccess && !subscriptions.length && (
        <p className="text-gray-80 text-left">
          You have no subscriptions. You can subscribe to shared folders from
          other nodes.
        </p>
      )}
      {isSuccess && !!subscriptions.length && (
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
              <MotionButton
                className="bg-gray-300 py-1.5 text-sm"
                isLoading={isPending}
                layout
                onClick={async () => {
                  if (!auth) return;
                  await unsubscribeSharedFolder({
                    nodeAddress: auth?.node_address,
                    shinkaiIdentity: auth?.shinkai_identity,
                    streamerNodeName: subscription.streaming_node,
                    streamerNodeProfile: subscription.streaming_profile,
                    profile: auth?.profile,
                    folderPath: subscription.shared_folder,
                    my_device_encryption_sk: auth?.my_device_encryption_sk,
                    my_device_identity_sk: auth?.my_device_identity_sk,
                    node_encryption_pk: auth?.node_encryption_pk,
                    profile_encryption_sk: auth?.profile_encryption_sk,
                    profile_identity_sk: auth?.profile_identity_sk,
                  });
                }}
                size="auto"
              >
                Unsubscribe
              </MotionButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscription;
