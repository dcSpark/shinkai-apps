import { useGetAvailableSharedFoldersWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getAvailableSharedItems/useGetAvailableSharedFoldersWithPagination';
import {
  Button,
  buttonVariants,
  ScrollArea,
} from '@shinkai_network/shinkai-ui';
import { SharedFolderIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useInView } from 'framer-motion';
import { Fragment, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { SubscribeButton } from '../components/subscriptions/components/subscription-button';
import { SubpageLayout } from './layout/simple-layout';

const FreeSubscriptionsPage = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    // isPending,
    isFetchingNextPage,
    isSuccess,
  } = useGetAvailableSharedFoldersWithPagination({
    search: '',
    priceFilter: 'free',
  });

  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const isLoadMoreButtonInView = useInView(loadMoreRef);

  useEffect(() => {
    if (isLoadMoreButtonInView && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isLoadMoreButtonInView]);

  const locationState = useLocation().state as { installLocally?: boolean };
  return (
    <div className="h-screen overflow-y-hidden">
      <SubpageLayout
        className="h-full"
        title="Subscribe To Knowledge Sources  📨"
      >
        <div className="flex h-full flex-col">
          <p className="text-gray-80 text-center text-base tracking-wide">
            Subscribe to get up-to-date info/content your AI can seamlessly use.
          </p>
          <div className="flex-1">
            {isSuccess && (
              <ScrollArea className="h-[450px] [&>div>div]:!block">
                <div className="h-full w-full">
                  {data?.pages.map((page, idx) => (
                    <Fragment key={idx}>
                      {page.values.map((sharedFolder) => {
                        return (
                          <div
                            className="flex min-h-[80px] cursor-pointer items-center justify-between gap-1 rounded-lg py-3.5 pr-2.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400"
                            key={sharedFolder.path}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-300/50 ">
                              <SharedFolderIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-col gap-1">
                                <span className="line-clamp-1 text-sm font-medium capitalize">
                                  {sharedFolder.path.replace(/\//g, '')}
                                </span>

                                <span className="text-gray-80 text-sm first-letter:uppercase">
                                  {sharedFolder.folderDescription}
                                </span>
                              </div>
                            </div>
                            <SubscribeButton
                              folderPath={sharedFolder.path}
                              nodeName={'localhost' ?? ''}
                            />
                          </div>
                        );
                      })}
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

          <Link
            className={cn(
              buttonVariants({
                size: 'lg',
              }),
              'mt-4 w-full',
            )}
            to={{
              pathname: locationState?.installLocally
                ? '/ai-model-installation'
                : '/',
            }}
          >
            Continue
          </Link>
        </div>
      </SubpageLayout>
    </div>
  );
};

export default FreeSubscriptionsPage;
