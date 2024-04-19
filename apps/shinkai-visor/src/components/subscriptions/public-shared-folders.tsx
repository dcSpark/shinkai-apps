import { useSubscribeToSharedFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/subscribeToSharedFolder/useSubscribeToSharedFolder';
import {
  FolderTreeNode,
  PriceFilters,
} from '@shinkai_network/shinkai-node-state/lib/queries/getAvailableSharedItems/types';
import { useGetAvailableSharedFoldersWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getAvailableSharedItems/useGetAvailableSharedFoldersWithPagination';
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
  ScrollArea,
  SharedFolderIcon,
  ToggleGroup,
  ToggleGroupItem,
} from '@shinkai_network/shinkai-ui';
import { motion, useInView } from 'framer-motion';
import { Maximize2, Minimize2, SearchIcon, XIcon } from 'lucide-react';
import { Tree, TreeExpandedKeysType } from 'primereact/tree';
import { TreeNode as PrimeTreeNode } from 'primereact/treenode';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useDebounce } from '../../hooks/use-debounce';
import { useAuth } from '../../store/auth/auth';
import { treeOptions } from '../create-job/constants';

const PublicSharedFolderSubscription = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [paidFilter, setPaidFilter] = React.useState<PriceFilters>('all');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isPending,
    isFetchingNextPage,
    isSuccess,
  } = useGetAvailableSharedFoldersWithPagination({
    search: debouncedSearchQuery,
    priceFilter: paidFilter,
  });

  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const isLoadMoreButtonInView = useInView(loadMoreRef);

  useEffect(() => {
    if (isLoadMoreButtonInView && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isLoadMoreButtonInView]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative flex h-10 w-full items-center">
        <Input
          className="placeholder-gray-80 !h-full bg-transparent py-2 pl-10"
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search..."
          value={searchQuery}
        />
        <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2 bg-gray-300" />
        {searchQuery && (
          <Button
            className="absolute right-1 h-8 w-8 bg-gray-200 p-2"
            onClick={() => {
              setSearchQuery('');
            }}
            size="auto"
            type="button"
            variant="ghost"
          >
            <XIcon />
            <span className="sr-only">Clear Search</span>
          </Button>
        )}
      </div>
      <ToggleGroup
        className="w-auto self-start rounded-full bg-gray-400 px-2 py-1"
        onValueChange={(value) => setPaidFilter(value as PriceFilters)}
        type="single"
        value={paidFilter}
      >
        <ToggleGroupItem
          className="min-w-[70px] rounded-full border-none"
          value="all"
          variant="outline"
        >
          All
        </ToggleGroupItem>
        <ToggleGroupItem
          className="min-w-[70px] rounded-full border-none"
          value="free"
        >
          Free
        </ToggleGroupItem>
        <ToggleGroupItem
          className="min-w-[70px] rounded-full border-none"
          value="paid"
          variant="outline"
        >
          Paid
        </ToggleGroupItem>
      </ToggleGroup>
      {isPending ||
        (debouncedSearchQuery !== searchQuery &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              className="flex h-[69px] items-center justify-between gap-2 rounded-lg bg-gray-400 py-3"
              key={idx}
            />
          )))}
      {isSuccess &&
        !data?.pages?.[0]?.values?.length &&
        debouncedSearchQuery === searchQuery && (
          <p className="text-gray-80 text-left">
            {searchQuery || paidFilter
              ? 'There are no public folders available that match your search criteria.'
              : 'There are no public folders available to subscribe to right now.'}
          </p>
        )}
      {isSuccess && debouncedSearchQuery === searchQuery && (
        <ScrollArea className="[&>div>div]:!block">
          <div className="w-full">
            {data?.pages.map((page, idx) => (
              <Fragment key={idx}>
                {page.values.map((sharedFolder) => (
                  <PublicSharedFolder
                    folderDescription={
                      sharedFolder?.folderDescription ?? 'no description found'
                    }
                    folderName={sharedFolder.path}
                    folderPath={sharedFolder.path}
                    folderTree={sharedFolder.raw.tree}
                    isFree={sharedFolder?.isFree}
                    key={`${sharedFolder?.identity?.identityRaw}::${sharedFolder.path}`}
                    nodeName={sharedFolder?.identity?.identityRaw ?? '-'}
                  />
                ))}
              </Fragment>
            ))}
            {hasNextPage && (
              <Button
                className="w-full"
                disabled={!hasNextPage}
                isLoading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                ref={loadMoreRef}
                size="auto"
                variant="ghost"
              >
                Load More
              </Button>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default PublicSharedFolderSubscription;

const MotionButton = motion(Button);

function transformTreeNode(
  node: FolderTreeNode,
  parentPath: string = '',
): PrimeTreeNode {
  const path = parentPath ? `${parentPath}/${node.name}` : node.path;
  return {
    id: path,
    key: path,
    label: node.path.replace(/\//g, ''),
    icon: Object.keys(node.children ?? {}).length ? 'icon-folder' : 'icon-file',
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
  folderTree: FolderTreeNode;
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

  const handleSubscription = async () => {
    if (!auth) return;
    await subscribeSharedFolder({
      nodeAddress: auth?.node_address,
      shinkaiIdentity: auth?.shinkai_identity,
      streamerNodeName: '@@' + nodeName,
      streamerNodeProfile: 'main', // TODO: missing from node endpoint
      profile: auth?.profile,
      folderPath: folderPath,
      my_device_encryption_sk: auth?.my_device_encryption_sk,
      my_device_identity_sk: auth?.my_device_identity_sk,
      node_encryption_pk: auth?.node_encryption_pk,
      profile_encryption_sk: auth?.profile_encryption_sk,
      profile_identity_sk: auth?.profile_identity_sk,
    });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex min-h-[92px] cursor-pointer items-center justify-between gap-1 rounded-lg py-3.5 pr-2.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400">
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
              await handleSubscription();
            }}
            size="auto"
            variant="outline"
          >
            Subscribe
          </MotionButton>
        </div>
      </DrawerTrigger>
      <FolderDetailsDrawerContent
        handleSubscription={handleSubscription}
        isSubscribing={isPending}
        nodes={[transformTreeNode(folderTree, '')]}
      />
    </Drawer>
  );
};

const FolderDetailsDrawerContent = ({
  nodes,
  handleSubscription,
  isSubscribing,
}: {
  nodes: PrimeTreeNode[];
  handleSubscription: () => void;
  isSubscribing: boolean;
}) => {
  const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({
    '0': true,
    '0-0': true,
  });

  const expandNode = (
    node: PrimeTreeNode,
    _expandedKeys: TreeExpandedKeysType,
  ) => {
    if (node.children && node.children.length) {
      _expandedKeys[node?.key ?? ''] = true;

      for (const child of node.children) {
        expandNode(child, _expandedKeys);
      }
    }
  };

  const expandAll = () => {
    const _expandedKeys = {};

    for (const node of nodes) {
      expandNode(node, _expandedKeys);
    }

    setExpandedKeys(_expandedKeys);
  };

  const collapseAll = () => {
    setExpandedKeys({});
  };

  return (
    <DrawerContent>
      <DrawerClose className="absolute right-4 top-5">
        <XIcon className="text-gray-80" />
      </DrawerClose>
      <DrawerHeader>
        <DrawerTitle className="mb-2">Shared Folder Details</DrawerTitle>
        <DrawerDescription>
          List of folders and files shared with you
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex flex-wrap justify-end gap-2">
        <Button onClick={expandAll} size="icon" type="button" variant="ghost">
          <Maximize2 className="h-4 w-4" />
          <span className="sr-only">Expand All</span>
        </Button>
        <Button onClick={collapseAll} size="icon" type="button" variant="ghost">
          <Minimize2 className="h-4 w-4" />
          <span className="sr-only">Collapse All</span>
        </Button>
      </div>

      <ScrollArea className="h-[70vh] [&>div>div]:!block">
        <Tree
          expandedKeys={expandedKeys}
          onToggle={(e) => setExpandedKeys(e.value as TreeExpandedKeysType)}
          pt={treeOptions}
          value={nodes}
        />
      </ScrollArea>
      <DrawerFooter>
        <MotionButton
          className="hover:border-brand w-full hover:bg-transparent hover:text-white"
          isLoading={isSubscribing}
          layout
          onClick={handleSubscription}
          size="auto"
          type="button"
          variant="outline"
        >
          Subscribe Now
        </MotionButton>
      </DrawerFooter>
    </DrawerContent>
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
      <div className="flex flex-col gap-1">
        {/*<a*/}
        {/*  className="transition-all hover:text-white hover:underline"*/}
        {/*  href="https://shinkai-contracts.pages.dev/"*/}
        {/*  onClick={(e) => e.stopPropagation()}*/}
        {/*  rel="noreferrer"*/}
        {/*  target="_blank"*/}
        {/*>*/}
        <span className="line-clamp-1 text-sm font-medium capitalize">
          {folderName.replace(/\//g, '')}
        </span>
        {/*</a>*/}

        <span className="text-gray-80 text-sm first-letter:uppercase">
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
