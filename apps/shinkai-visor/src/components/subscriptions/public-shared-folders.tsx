import { useSubscribeToSharedFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/subscribeToSharedFolder/useSubscribeToSharedFolder';
import { useGetAvailableSharedItems } from '@shinkai_network/shinkai-node-state/lib/queries/getAvailableSharedItems/useGetAvailableSharedItems';
import { Button } from '@shinkai_network/shinkai-ui';
import { motion } from 'framer-motion';
import React from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';

const PublicSharedFolderSubscription = () => {
  const auth = useAuth((state) => state.auth);

  const { data: sharedItems, isSuccess } = useGetAvailableSharedItems(
    {
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
    {
      refetchInterval: 6000,
    },
  );

  return (
    <div className="flex h-full flex-col gap-4">
      {isSuccess && !Object.entries(sharedItems?.response || {}).length && (
        <p className="text-gray-80 text-left">
          There are no public folders available to subscribe to right now.
        </p>
      )}
      <div className="w-full divide-y divide-gray-300 py-4">
        {Object.entries(sharedItems?.response || {}).map(
          ([filename, fileDetails]) => (
            <SubscriptionItem
              folderDescription={
                fileDetails?.subscription_requirement.folder_description
              }
              folderName={filename}
              folderPath={fileDetails.path}
              isFree={fileDetails.subscription_requirement.is_free}
              key={fileDetails.path}
              nodeName={sharedItems?.node_name ?? '-'}
            />
          ),
        )}
      </div>
    </div>
  );
};

export default PublicSharedFolderSubscription;

const MotionButton = motion(Button);

export const SubscriptionItem = ({
  folderName,
  nodeName,
  isFree,
  folderPath,
  folderDescription,
}: {
  folderName: string;
  folderPath: string;
  folderDescription: string;
  nodeName: string;
  isFree: boolean;
}) => {
  const auth = useAuth((state) => state.auth);
  const { mutateAsync: subscribeSharedFolder, isPending } =
    useSubscribeToSharedFolder({
      onSuccess: () => {
        toast.success('Subscription added');
      },
      onError: (error) => {
        toast.error('Error adding subscription', {
          description: error.message,
        });
      },
    });

  return (
    <div
      className="flex items-center justify-between gap-2 py-2.5"
      key={folderPath}
    >
      <div className="space-y-1">
        <span className="line-clamp-1 text-base font-medium capitalize">
          {folderName.replace(/\//g, '')}
        </span>
        <span className="text-gray-80 capitalize">{folderDescription}</span>
        <div className="text-gray-80 flex items-center gap-3 text-xs">
          <span>{nodeName} </span> ⋅ <span>{isFree ? 'Free' : 'Paid'} </span>{' '}
        </div>
      </div>
      <MotionButton
        className="py-1.5 text-sm"
        disabled={isPending}
        isLoading={isPending}
        layout
        onClick={async () => {
          if (!auth) return;
          const [node, nodeProfile] = nodeName.split('/');
          await subscribeSharedFolder({
            nodeAddress: auth?.node_address,
            shinkaiIdentity: auth?.shinkai_identity,
            streamerNodeName: node,
            streamerNodeProfile: nodeProfile,
            profile: auth?.profile,
            folderPath: folderPath,
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
      </MotionButton>
    </div>
  );
};
