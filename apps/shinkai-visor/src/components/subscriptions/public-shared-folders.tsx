import { useSubscribeToSharedFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/subscribeToSharedFolder/useSubscribeToSharedFolder';
import { useGetAvailableSharedItems } from '@shinkai_network/shinkai-node-state/lib/queries/getAvailableSharedItems/useGetAvailableSharedItems';
import { Button, SharedFolderIcon } from '@shinkai_network/shinkai-ui';
import { motion } from 'framer-motion';
import React from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';

const PublicSharedFolderSubscription = () => {
  const auth = useAuth((state) => state.auth);

  const {
    data: sharedItems,
    isSuccess,
    isPending,
  } = useGetAvailableSharedItems(
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
      {isPending &&
        Array.from({ length: 4 }).map((_, idx) => (
          <div
            className="flex h-[69px] items-center justify-between gap-2 rounded-md bg-gray-400 py-3"
            key={idx}
          />
        ))}
      {isSuccess && (
        <div className="w-full">
          {Object.entries(sharedItems?.response || {}).map(
            ([filename, fileDetails]) => (
              <PublicSharedFolder
                folderDescription={
                  fileDetails?.subscription_requirement?.folder_description ??
                  ''
                }
                folderName={filename}
                folderPath={fileDetails.path}
                isFree={fileDetails?.subscription_requirement?.is_free ?? true}
                key={fileDetails.path}
                nodeName={sharedItems?.node_name ?? '-'}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default PublicSharedFolderSubscription;

const MotionButton = motion(Button);

export const PublicSharedFolder = ({
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
      className="flex min-h-[92px] cursor-pointer items-center justify-between gap-2 rounded-lg py-3.5 pr-2.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400"
      key={folderPath}
      onClick={() =>
        window.open(`https://shinkai-contracts.pages.dev/`, '_blank')
      }
      role="button"
      tabIndex={0}
    >
      <SubscriptionInfo
        folderDescription={folderDescription}
        folderName={folderName.replace(/\//g, '')}
        isFree={isFree}
        nodeName={nodeName}
      />
      <MotionButton
        className="hover:border-brand py-1.5 text-sm hover:bg-transparent hover:text-white"
        disabled={isPending}
        isLoading={isPending}
        layout
        onClick={async (event) => {
          event.stopPropagation();
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
        variant="outline"
      >
        Subscribe
      </MotionButton>
    </div>
  );
};

export const SubscriptionInfo = ({
  folderName,
  nodeName,
  isFree,
  folderDescription,
}: {
  folderName: string;
  folderDescription: string;
  nodeName: string;
  isFree: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-300/50 ">
      <SharedFolderIcon className="h-6 w-6" />
    </div>
    <div className="space-y-3">
      <div className="space-y-1">
        <a
          className="transition-all hover:text-white hover:underline"
          href="https://shinkai-contracts.pages.dev/"
          onClick={(e) => e.stopPropagation()}
          rel="noreferrer"
          target="_blank"
        >
          <span className="line-clamp-1 text-sm font-medium capitalize">
            {folderName.replace(/\//g, '')}
          </span>
        </a>

        <span className="text-gray-80 text-sm capitalize">
          {folderDescription}
        </span>
      </div>
      <div className="text-gray-80 flex items-center gap-2 text-xs">
        <a
          className="transition-all hover:text-white hover:underline"
          href="https://shinkai-contracts.pages.dev/identity/kao0112_9850.sepolia-shinkai"
          onClick={(e) => e.stopPropagation()}
          rel="noreferrer"
          target="_blank"
        >
          <span>{nodeName} </span>
        </a>
        ⋅ <span>{isFree ? 'Free' : 'Paid'} </span>{' '}
      </div>
    </div>
  </div>
);
