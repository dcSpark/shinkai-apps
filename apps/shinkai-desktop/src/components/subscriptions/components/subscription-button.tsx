import { useSubscribeToSharedFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/subscribeToSharedFolder/useSubscribeToSharedFolder';
import { useUnsubscribeToSharedFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/unsubscribeToSharedFolder/useUnsubscribeToSharedFolder';
import { Button } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';

const MotionButton = motion(Button);

export const UnsubscribeButton = ({
  streamerNodeName,
  streamerNodeProfile,
  folderPath,
  fullWidth,
}: {
  streamerNodeName: string;
  streamerNodeProfile: string;
  folderPath: string;
  fullWidth?: boolean;
}) => {
  const auth = useAuth((state) => state.auth);
  const {
    mutateAsync: unsubscribeSharedFolder,
    isPending: isUnsubscribingPending,
  } = useUnsubscribeToSharedFolder({
    onSuccess: () => {
      toast.success('Subscription removed');
    },
    onError: (error) => {
      toast.error('Error removing subscription', {
        description: error.message,
      });
    },
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <MotionButton
      className={cn(
        'border-[#f1e6d2] py-1.5 text-sm text-[#e3d9c4] hover:border-red-800 hover:bg-red-700/50 hover:text-red-50',
      )}
      disabled={isUnsubscribingPending}
      isLoading={isUnsubscribingPending}
      layout
      onClick={async (event) => {
        event.stopPropagation();
        if (!auth) return;
        await unsubscribeSharedFolder({
          nodeAddress: auth?.node_address,
          shinkaiIdentity: auth?.shinkai_identity,
          streamerNodeName,
          streamerNodeProfile,
          profile: auth?.profile,
          folderPath,
          my_device_encryption_sk: auth?.my_device_encryption_sk,
          my_device_identity_sk: auth?.my_device_identity_sk,
          node_encryption_pk: auth?.node_encryption_pk,
          profile_encryption_sk: auth?.profile_encryption_sk,
          profile_identity_sk: auth?.profile_identity_sk,
        });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      size={fullWidth ? 'lg' : 'auto'}
      variant="outline"
    >
      {isHovered ? 'Unsubscribe' : 'Subscribed'}
    </MotionButton>
  );
};

export const SubscribeButton = ({
  nodeName,
  folderPath,
  fullWidth,
}: {
  nodeName: string;
  folderPath: string;
  fullWidth?: boolean;
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
    <MotionButton
      className="hover:border-brand py-1.5 text-sm hover:bg-transparent hover:text-white"
      disabled={isPending}
      isLoading={isPending}
      layout
      onClick={async (event) => {
        event.stopPropagation();
        if (!auth) return;
        await subscribeSharedFolder({
          nodeAddress: auth?.node_address,
          shinkaiIdentity: auth?.shinkai_identity,
          streamerNodeName: nodeName,
          streamerNodeProfile: 'main', // TODO: missing from node endpoint
          profile: auth?.profile,
          folderPath: folderPath,
          my_device_encryption_sk: auth?.my_device_encryption_sk,
          my_device_identity_sk: auth?.my_device_identity_sk,
          node_encryption_pk: auth?.node_encryption_pk,
          profile_encryption_sk: auth?.profile_encryption_sk,
          profile_identity_sk: auth?.profile_identity_sk,
        });
      }}
      size={fullWidth ? 'lg' : 'auto'}
      variant="outline"
    >
      Subscribe
    </MotionButton>
  );
};
