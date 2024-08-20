import {
  // JSShinkaiTool,
  ShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/lib/mutations/updateTool/useUpdateTool';
import { useGetToolsList } from '@shinkai_network/shinkai-node-state/lib/queries/getToolsList/useGetToolsList';
import { useGetToolsSearch } from '@shinkai_network/shinkai-node-state/lib/queries/getToolsSearch/useGetToolsSearch';
import {
  Avatar,
  AvatarFallback,
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
            className="placeholder-gray-80 !h-full bg-transparent py-2 pl-10"
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
        <div className="grid grid-cols-1 gap-4">
          {(isPending || !isSearchQuerySynced || isSearchToolListPending) &&
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                className={cn(
                  buttonVariants({
                    variant: 'outline',
                    size: 'auto',
                  }),
                  'flex h-[180px] animate-pulse flex-col items-start gap-3 rounded-md bg-gray-500 px-0 pb-0 hover:bg-transparent',
                )}
                key={idx}
              >
                <div className="mb-4 flex w-full flex-1 flex-col gap-4 px-4">
                  <span className="h-4 w-36 rounded-sm bg-gray-300" />
                  <span className="h-3 w-full rounded-sm bg-gray-300" />
                  <span className="h-3 w-full rounded-sm bg-gray-300" />
                </div>
                <div className="flex w-full items-center justify-between border-t px-4 py-2">
                  <span className="h-9 w-28 rounded-md bg-gray-300" />
                  <span className="h-6 w-16 rounded-full bg-gray-300" />
                </div>
              </div>
            ))}
          {!searchQuery &&
            isSearchQuerySynced &&
            toolsList?.map((tool) => (
              <div
                className={cn(
                  'rounded-sm border border-gray-200 bg-transparent text-left text-sm shadow-sm',
                  'rounded-lg bg-gray-500 text-left transition-shadow duration-200 hover:bg-gray-500 hover:shadow-xl',
                )}
                key={tool.tool_router_key}
              >
                <div className="flex h-[150px] flex-col gap-2.5 px-4 py-3.5">
                  <span className="text-sm font-medium text-white">
                    {formatText(tool.name)}{' '}
                  </span>
                  <p className="text-gray-80 line-clamp-2 text-sm">
                    {tool.description}
                  </p>
                  <div className="mt-auto flex items-center gap-2">
                    <Avatar className="bg-brand-gradient h-5 w-5 border text-xs text-gray-50">
                      <AvatarFallback className="">
                        {tool.author.replace(/@/g, '').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-80 text-xs">{tool.author}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t px-4 py-2">
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
                              node_encryption_pk:
                                auth?.node_encryption_pk ?? '',
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
              </div>
            ))}
          {searchQuery &&
            isSearchQuerySynced &&
            searchToolList?.map((tool) => (
              <div
                className={cn(
                  'rounded-sm border border-gray-200 bg-transparent text-left text-sm shadow-sm',
                  'rounded-lg bg-gray-500 text-left transition-shadow duration-200 hover:bg-gray-500 hover:shadow-xl',
                )}
                key={tool.tool_router_key}
              >
                <div className="flex h-[150px] flex-col gap-2.5 px-4 py-3.5">
                  <span className="text-sm font-medium text-white">
                    {formatText(tool.name)}{' '}
                  </span>
                  <p className="text-gray-80 line-clamp-2 text-sm">
                    {tool.description}
                  </p>
                  <div className="mt-auto flex items-center gap-2">
                    <Avatar className="bg-brand-gradient h-5 w-5 border text-xs text-gray-50">
                      <AvatarFallback className="">
                        {tool.author.replace(/@/g, '').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-80 text-xs">{tool.author}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t px-4 py-2">
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
                              node_encryption_pk:
                                auth?.node_encryption_pk ?? '',
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
