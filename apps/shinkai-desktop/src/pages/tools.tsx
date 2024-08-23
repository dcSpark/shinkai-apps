import {
  // JSShinkaiTool,
  ShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/lib/mutations/updateTool/useUpdateTool';
import { useGetToolsList } from '@shinkai_network/shinkai-node-state/lib/queries/getToolsList/useGetToolsList';
import { useGetToolsSearch } from '@shinkai_network/shinkai-node-state/lib/queries/getToolsSearch/useGetToolsSearch';
import {
  Badge,
  Button,
  buttonVariants,
  Input,
  ScrollArea,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BoltIcon, SearchIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useDebounce } from '../hooks/use-debounce';
import { useAuth } from '../store/auth';
import { formatText } from './create-job';
import { SimpleLayout } from './layout/simple-layout';

export const Tools = () => {
  const auth = useAuth((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;

  const { data: toolsList, isPending } = useGetToolsList({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { data: searchToolList, isLoading: isSearchToolListPending } =
    useGetToolsSearch(
      {
        nodeAddress: auth?.node_address ?? '',
        shinkaiIdentity: auth?.shinkai_identity ?? '',
        profile: auth?.profile ?? '',
        search: debouncedSearchQuery,
        my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
        my_device_identity_sk: auth?.my_device_identity_sk ?? '',
        node_encryption_pk: auth?.node_encryption_pk ?? '',
        profile_encryption_sk: auth?.profile_encryption_sk ?? '',
        profile_identity_sk: auth?.profile_identity_sk ?? '',
      },
      {
        enabled: isSearchQuerySynced,
      },
    );

  const { mutateAsync: updateTool } = useUpdateTool();

  return (
    <SimpleLayout classname="max-w-3xl" title={'Shinkai Tools'}>
      <ScrollArea className="pr-4 [&>div>div]:!block">
        <div className="relative mb-4 flex h-10 w-full items-center">
          <Input
            className="placeholder-gray-80 !h-full border-none bg-gray-400 py-2 pl-10"
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Search..."
            spellCheck={false}
            value={searchQuery}
          />
          <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2" />
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
        <div className="divide-y divide-gray-300">
          {(isPending || !isSearchQuerySynced || isSearchToolListPending) &&
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                className={cn(
                  'grid animate-pulse grid-cols-[1fr_115px_36px] items-center gap-5 rounded-sm bg-gray-500 px-2 py-4 text-left text-sm',
                )}
                key={idx}
              >
                <div className="flex w-full flex-1 flex-col gap-3">
                  <span className="h-4 w-36 rounded-sm bg-gray-300" />
                  <div className="flex flex-col gap-1">
                    <span className="h-3 w-full rounded-sm bg-gray-300" />
                    <span className="h-3 w-2/4 rounded-sm bg-gray-300" />
                  </div>
                </div>
                <span className="h-7 w-full rounded-md bg-gray-300" />
                <span className="h-5 w-[36px] rounded-full bg-gray-300" />
              </div>
            ))}
          {!searchQuery &&
            isSearchQuerySynced &&
            toolsList?.map((tool) => (
              <div
                className={cn(
                  'grid grid-cols-[1fr_115px_36px] items-center gap-5 rounded-sm bg-gray-500 px-2 py-4 text-left text-sm',
                )}
                key={tool.tool_router_key}
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {formatText(tool.name)}{' '}
                    </span>
                    {tool.author !== '@@official.shinkai' && (
                      <Badge className="text-gray-80 bg-gray-200 text-xs font-normal">
                        {tool.author}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-80 line-clamp-2 text-xs">
                    {tool.description}
                  </p>
                </div>
                <Link
                  className={cn(
                    buttonVariants({
                      variant: 'outline',
                      size: 'sm',
                    }),
                    'min-h-auto h-auto rounded-md py-2',
                  )}
                  to={`/tools/${tool.tool_router_key}`}
                >
                  <BoltIcon className="mr-1.5 h-4 w-4" />
                  Configure
                </Link>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <Switch
                        checked={tool.enabled}
                        onCheckedChange={async () => {
                          await updateTool({
                            toolKey: tool.tool_router_key,
                            toolType: tool.tool_type,
                            toolPayload: {} as ShinkaiTool,
                            isToolEnabled: !tool.enabled,
                            nodeAddress: auth?.node_address ?? '',
                            shinkaiIdentity: auth?.shinkai_identity ?? '',
                            profile: auth?.profile ?? '',
                            my_device_encryption_sk:
                              auth?.my_device_encryption_sk ?? '',
                            my_device_identity_sk:
                              auth?.my_device_identity_sk ?? '',
                            node_encryption_pk: auth?.node_encryption_pk ?? '',
                            profile_encryption_sk:
                              auth?.profile_encryption_sk ?? '',
                            profile_identity_sk:
                              auth?.profile_identity_sk ?? '',
                          });
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent align="center" side="top">
                        Enabled
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          {searchQuery &&
            isSearchQuerySynced &&
            searchToolList?.map((tool) => (
              <div
                className={cn(
                  'grid grid-cols-[1fr_115px_36px] items-center gap-5 rounded-sm bg-gray-500 px-2 py-4 text-left text-sm',
                )}
                key={tool.tool_router_key}
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {formatText(tool.name)}{' '}
                    </span>
                    {tool.author !== '@@official.shinkai' && (
                      <Badge className="text-gray-80 bg-gray-200 text-xs font-normal">
                        {tool.author}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-80 line-clamp-2 text-xs">
                    {tool.description}
                  </p>
                </div>

                <Link
                  className={cn(
                    buttonVariants({
                      variant: 'outline',
                      size: 'sm',
                    }),
                    'min-h-auto h-auto rounded-md py-2',
                  )}
                  to={`/tools/${tool.tool_router_key}`}
                >
                  <BoltIcon className="mr-1.5 h-4 w-4" />
                  Configure
                </Link>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <Switch
                        checked={tool.enabled}
                        onCheckedChange={async () => {
                          await updateTool({
                            toolKey: tool.tool_router_key,
                            toolType: tool.tool_type,
                            toolPayload: {} as ShinkaiTool,
                            isToolEnabled: !tool.enabled,
                            nodeAddress: auth?.node_address ?? '',
                            shinkaiIdentity: auth?.shinkai_identity ?? '',
                            profile: auth?.profile ?? '',
                            my_device_encryption_sk:
                              auth?.my_device_encryption_sk ?? '',
                            my_device_identity_sk:
                              auth?.my_device_identity_sk ?? '',
                            node_encryption_pk: auth?.node_encryption_pk ?? '',
                            profile_encryption_sk:
                              auth?.profile_encryption_sk ?? '',
                            profile_identity_sk:
                              auth?.profile_identity_sk ?? '',
                          });
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent align="center" side="top">
                        Enabled
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          {searchQuery &&
            isSearchQuerySynced &&
            searchToolList?.length === 0 && (
              <div className="flex h-20 items-center justify-center">
                <p className="text-gray-80 text-sm">
                  No tools found for the search query
                </p>
              </div>
            )}
        </div>
      </ScrollArea>
    </SimpleLayout>
  );
};
