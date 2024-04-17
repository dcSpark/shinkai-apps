import { useSubscribeToSharedFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/subscribeToSharedFolder/useSubscribeToSharedFolder';
import { TreeNode } from '@shinkai_network/shinkai-node-state/lib/queries/getAvailableSharedItems/index';
import { useGetAvailableSharedFolders } from '@shinkai_network/shinkai-node-state/lib/queries/getAvailableSharedItems/useGetAvailableSharedFolders';
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  ScrollArea,
  SharedFolderIcon,
} from '@shinkai_network/shinkai-ui';
import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { Tree } from 'primereact/tree';
import { TreeNode as PrimeTreeNode } from 'primereact/treenode';
import React from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';
import { treeOptions } from '../create-job/constants';

const PublicSharedFolderSubscription = () => {
  const {
    data: sharedFolders,
    isSuccess,
    isPending,
  } = useGetAvailableSharedFolders({ page: 0, pageSize: 10 });

  return (
    <div className="flex h-full flex-col gap-4">
      {isSuccess && !sharedFolders.values.length && (
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
          {sharedFolders.values.map((sharedFolder) => (
            <PublicSharedFolder
              folderDescription={
                sharedFolder?.subscription_requirement?.folder_description ??
                'missing short description'
              }
              folderName={sharedFolder.path}
              folderPath={sharedFolder.path}
              folderTree={sharedFolder.tree}
              isFree={sharedFolder?.subscription_requirement?.is_free ?? true}
              key={sharedFolder.path}
              nodeName={sharedFolder.identityRaw ?? '-'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicSharedFolderSubscription;

const MotionButton = motion(Button);

function transformTreeNode(
  node: TreeNode,
  parentPath: string = '',
): PrimeTreeNode {
  const path = parentPath ? `${parentPath}/${node.name}` : node.name;
  return {
    id: path,
    key: path,
    label: node.path.replace(/\//g, ''),
    icon: 'icon-folder',
    data: {
      path: node.path,
      last_modified: node.last_modified,
    },
    children: Object.keys(node.children ?? {}).map((key) =>
      transformTreeNode(node.children[key], path),
    ),
  };
}

export const PublicSharedFolder = ({
  folderName,
  nodeName,
  isFree,
  folderPath,
  folderDescription,
  folderTree,
}: {
  folderName: string;
  folderPath: string;
  folderDescription: string;
  nodeName: string;
  isFree: boolean;
  folderTree: TreeNode;
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
    <Drawer>
      <DrawerTrigger asChild>
        <div
          className="flex min-h-[92px] cursor-pointer items-center justify-between gap-2 rounded-lg py-3.5 pr-2.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400"
          // key={folderPath}
          // onClick={() =>
          //   window.open(`https://shinkai-contracts.pages.dev/`, '_blank')
          // }
          // role="button"
          // tabIndex={0}
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
              await subscribeSharedFolder({
                nodeAddress: auth?.node_address,
                shinkaiIdentity: auth?.shinkai_identity,
                streamerNodeName: '@@' + nodeName,
                streamerNodeProfile: 'main', // TODO: validate
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
      </DrawerTrigger>
      <DrawerContent className="min-h-[300px]">
        <DrawerClose className="absolute right-4 top-5">
          <XIcon className="text-gray-80" />
        </DrawerClose>
        <DrawerHeader>
          <DrawerTitle>Shared Folder Details</DrawerTitle>
          <DrawerDescription className="mb-4 mt-2">
            List of folders and files shared with you
          </DrawerDescription>
          <ScrollArea className="h-[60vh]">
            <Tree
              pt={treeOptions}
              value={[transformTreeNode(folderTree, '')]}
            />
          </ScrollArea>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
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
          href={`https://shinkai-contracts.pages.dev/identity/${nodeName}`}
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
