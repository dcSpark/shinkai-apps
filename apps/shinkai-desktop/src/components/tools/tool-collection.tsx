import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { GetToolsCategory } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useDisableAllTools } from '@shinkai_network/shinkai-node-state/v2/mutations/disableAllTools/useDisableAllTools';
import { useEnableAllTools } from '@shinkai_network/shinkai-node-state/v2/mutations/enableAllTools/useEnableAllTools';
import { useSetToolMcpEnabled } from '@shinkai_network/shinkai-node-state/v2/mutations/setToolMcpEnabled/useSetToolMcpEnabled';
import { useToggleEnableTool } from '@shinkai_network/shinkai-node-state/v2/mutations/toggleEnableTool/useToggleEnableTool';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/v2/queries/getHealth/useGetHealth';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useGetSearchTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsSearch/useGetToolsSearch';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, MoreVerticalIcon, SearchIcon, XIcon } from 'lucide-react';
import { useEffect,useState } from 'react';
import { toast } from 'sonner';

import { useDebounce } from '../../hooks/use-debounce';
import { useAuth } from '../../store/auth';
import { usePlaygroundStore } from '../playground-tool/context/playground-context';
import ToolCard from './components/tool-card';

const toolsGroup: {
  label: string;
  value: GetToolsCategory;
}[] = [

  {
    label: 'MCP Servers',
    value: 'mcp_servers',
  },
  {
    label: 'Default Tools',
    value: 'default',
  },
  {
    label: 'My Tools',
    value: 'my_tools',
  },
  {
    label: 'Downloaded',
    value: 'downloaded',
  },
];

const ToolCollectionBase = () => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;
  
  const [mcpEnabledState, setMcpEnabledState] = useState<Record<string, boolean>>({});

  const selectedToolCategory = usePlaygroundStore(
    (state) => state.selectedToolCategory,
  );

  const setSelectedToolCategory = usePlaygroundStore(
    (state) => state.setSelectedToolCategory,
  );

  const { data: toolsList, isPending } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    category: selectedToolCategory === 'all' ? undefined : selectedToolCategory,
  });
  
  useEffect(() => {
    if (toolsList && toolsList.length > 0) {
      const initialState: Record<string, boolean> = {};
      toolsList.forEach(tool => {
        initialState[tool.tool_router_key] = tool.mcp_enabled === true;
      });
      setMcpEnabledState(initialState);
    }
  }, [toolsList]);

  const {
    data: searchToolList,
    isLoading: isSearchToolListPending,
    isSuccess: isSearchToolListSuccess,
  } = useGetSearchTools(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      search: debouncedSearchQuery,
    },
    { enabled: isSearchQuerySynced && !!searchQuery },
  );

  const { mutateAsync: enableAllTools } = useEnableAllTools({
    onSuccess: () => {
      toast.success('All tools were enabled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error.message);
    },
  });
  const { mutateAsync: disableAllTools } = useDisableAllTools({
    onSuccess: () => {
      toast.success('All tools were disabled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error.message);
    },
  });

  const { mutateAsync: setToolMcpEnabled } = useSetToolMcpEnabled({
    onSuccess: () => {
      toast.success('MCP server mode updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const { mutateAsync: toggleEnableTool } = useToggleEnableTool({
    onSuccess: () => {
      toast.success('Tool state updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex flex-col gap-8 max-w-[956px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Shinkai Tools
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('tools.description')}
          </p>
        </div>
        <div className="shadow-official-gray-950 focus-within:shadow-official-gray-700 relative flex h-10 items-center rounded-lg shadow-[0_0_0_1px_currentColor] transition-shadow">
          <Input
            className="placeholder-gray-80 bg-official-gray-900 !h-full border-none py-2 pl-10"
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
              <span className="sr-only">{t('common.clearSearch')}</span>
            </Button>
          )}
        </div>
      </div>

      {searchQuery && isSearchQuerySynced && searchToolList?.length === 0 && (
        <div className="flex h-20 items-center justify-center">
          <p className="text-gray-80 text-sm">
            {t('tools.emptyState.search.text')}
          </p>
        </div>
      )}
      {searchQuery &&
        isSearchQuerySynced &&
        isSearchToolListSuccess &&
        searchToolList?.length > 0 && (
          <div className="divide-official-gray-780 grid grid-cols-1 divide-y py-4">
            {searchToolList?.map((tool) => (
              <ToolCard key={tool.tool_router_key} tool={tool} />
            ))}
          </div>
        )}
      {!searchQuery && isSearchQuerySynced && (
        <div>
          <div className="flex w-full items-center justify-between">
            <ToggleGroup
              className="border-official-gray-780 rounded-full border bg-transparent px-0.5 py-1"
              onValueChange={(value) => {
                setSelectedToolCategory(value as GetToolsCategory);
              }}
              type="single"
              value={selectedToolCategory}
            >
              <ToggleGroupItem
                className="data-[state=on]:bg-official-gray-850 text-official-gray-400 rounded-full bg-transparent px-3 py-2.5 text-xs font-medium data-[state=on]:text-white"
                key="all"
                size="sm"
                value="all"
              >
                All
              </ToggleGroupItem>
              {toolsGroup.map((tool) => (
                <ToggleGroupItem
                  className="data-[state=on]:bg-official-gray-850 text-official-gray-400 rounded-full bg-transparent px-3 py-2.5 text-xs font-medium data-[state=on]:text-white"
                  key={tool.value}
                  size="sm"
                  value={tool.value}
                >
                  {tool.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {selectedToolCategory === 'mcp_servers' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="text-official-gray-400 hover:text-white" size="sm" variant="ghost">
                    Add To External Client
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    Claude Desktop
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Cursor
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Custom
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="text-gray-80"
                  rounded="lg"
                  size="icon"
                  variant="outline"
                >
                  <MoreVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-300 p-2.5">
                <DropdownMenuItem
                  className="text-xs"
                  onClick={() => {
                    enableAllTools({
                      nodeAddress: auth?.node_address ?? '',
                      token: auth?.api_v2_key ?? '',
                    });
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Enable All Tools
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs"
                  onClick={() => {
                    disableAllTools({
                      nodeAddress: auth?.node_address ?? '',
                      token: auth?.api_v2_key ?? '',
                    });
                  }}
                >
                  <EyeOff className="mr-2 h-4 w-4" />
                  Disable All Tools
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="divide-official-gray-780 grid grid-cols-1 divide-y py-4">
            {toolsList?.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <p className="text-official-gray-400 text-sm">
                  No tools found in this category. Create a new tool or install
                  from the App Store.
                </p>
              </div>
            ) : selectedToolCategory === 'mcp_servers' ? (
              toolsList?.map((tool) => (
                <div
                  className={cn(
                    'grid grid-cols-[1fr_120px_40px_115px_36px] items-center gap-5 rounded-sm px-2 py-4 pr-4 text-left text-sm',
                  )}
                  key={tool.tool_router_key}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {tool.name}{' '}
                      </span>
                      <Badge className="text-gray-80 bg-official-gray-750 text-xs font-normal">
                        {tool.author}
                      </Badge>
                    </div>
                    <p className="text-gray-80 line-clamp-2 text-xs">{tool.description}</p>
                  </div>
                  <div />
                  <div />
                  <div className="text-gray-80 text-xs flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild className="flex items-center gap-1">
                        <Button 
                          className={
                            (mcpEnabledState[tool.tool_router_key] !== undefined 
                              ? mcpEnabledState[tool.tool_router_key] 
                              : tool.mcp_enabled === true) 
                            ? "text-green-400" 
                            : ""
                          } 
                          disabled={tool.enabled !== true}
                          onClick={async () => {
                            if (auth) {
                              if (tool.enabled !== true) {
                                toast.error('Tool must be enabled before changing MCP server mode');
                                return;
                              }
                              
                              const currentState = mcpEnabledState[tool.tool_router_key] !== undefined 
                                ? mcpEnabledState[tool.tool_router_key] 
                                : tool.mcp_enabled === true;
                              const newMcpEnabled = !currentState;
                              
                              const updatedTool = {
                                ...tool,
                                mcp_enabled: newMcpEnabled,
                              };
                              
                              queryClient.getQueryData([FunctionKeyV2.GET_LIST_TOOLS]);

                              queryClient.setQueryData(
                                [FunctionKeyV2.GET_LIST_TOOLS],
                                (oldData: unknown) => {
                                  if (!oldData || !Array.isArray(oldData)) {
                                    return oldData;
                                  }
                                  
                                  return oldData.map((t) =>
                                    t.tool_router_key === tool.tool_router_key ? updatedTool : t
                                  );
                                }
                              );
                              
                              queryClient.getQueryData([FunctionKeyV2.GET_LIST_TOOLS]);
                              
                              // queryClient.invalidateQueries({
                              //   queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
                              // });

                              setMcpEnabledState(prev => ({
                                ...prev,
                                [tool.tool_router_key]: newMcpEnabled
                              }));
                              
                              try {
                                await setToolMcpEnabled({
                                  toolRouterKey: tool.tool_router_key,
                                  mcpEnabled: newMcpEnabled,
                                  nodeAddress: auth.node_address,
                                  token: auth.api_v2_key,
                                });
                              } catch (error) {
                                setMcpEnabledState(prev => ({
                                  ...prev,
                                  [tool.tool_router_key]: tool.mcp_enabled === true
                                }));
                                
                                queryClient.setQueryData(
                                  [FunctionKeyV2.GET_LIST_TOOLS],
                                  (oldData: unknown) => {
                                    if (!oldData || !Array.isArray(oldData)) return oldData;
                                    return oldData.map((t) =>
                                      t.tool_router_key === tool.tool_router_key ? { ...tool } : t
                                    );
                                  }
                                );
                                throw error; // Let the error handler handle the error
                              }
                            }
                          }}
                          size="sm"
                          variant="ghost"
                        >
                          {mcpEnabledState[tool.tool_router_key] !== undefined 
                            ? mcpEnabledState[tool.tool_router_key] ? "Enabled" : "Disabled"
                            : tool.mcp_enabled === true ? "Enabled" : "Disabled"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent align="center" side="top">
                          {tool.enabled !== true 
                            ? "Enable tool first to manage MCP Server mode" 
                            : `MCP Server ${mcpEnabledState[tool.tool_router_key] !== undefined 
                                ? mcpEnabledState[tool.tool_router_key] ? "Enabled" : "Disabled"
                                : tool.mcp_enabled === true ? "Enabled" : "Disabled"}`}
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild className="flex items-center gap-1">
                      <div>
                        <Switch
                          checked={tool.enabled === true}
                          onCheckedChange={async () => {
                            if (auth) {
                              await toggleEnableTool({
                                toolKey: tool.tool_router_key,
                                isToolEnabled: tool.enabled !== true,
                                nodeAddress: auth.node_address,
                                token: auth.api_v2_key,
                              });
                            }
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent align="center" side="top">
                        Tool Enabled
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </div>
              ))
            ) : (
              toolsList?.map((tool) => (
                <ToolCard key={tool.tool_router_key} tool={tool} />
              ))
            )}
          </div>
        </div>
      )}

      {(isPending || !isSearchQuerySynced || isSearchToolListPending) && (
        <div className="divide-official-gray-780 grid grid-cols-1 divide-y py-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              className={cn(
                'grid animate-pulse grid-cols-[1fr_40px_115px_36px] items-center gap-5 rounded-sm px-2 py-3 pr-4 text-left text-sm',
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
              <span className="h-7 w-10 rounded-md bg-gray-300" />
              <span className="h-5 w-[36px] rounded-full bg-gray-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export const ToolCollection = () => {
  return <ToolCollectionBase />;
};

export function DockerStatus() {
  const auth = useAuth((state) => state.auth);
  const { data: health } = useGetHealth({
    nodeAddress: auth?.node_address ?? '',
  });

  const statusConfig = {
    'not-installed': {
      title: 'Docker Not Installed',
      description:
        'Docker is not installed on your system. Installing it will unlock better performance, faster processing, and an improved AI tool experience.',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    'not-running': {
      title: 'Docker Installed but Not Running',
      description:
        'Docker is installed but not running. Start it now to improve tool execution speed, stability, and overall performance.',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
    running: {
      title: 'Docker Running & Active',
      description:
        'Your tools are now running at full efficiency with Docker. Enjoy a smoother experience!',
      color: 'bg-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  };

  const config = statusConfig[health?.docker_status ?? 'not-installed'];

  return (
    <Tooltip>
      <TooltipTrigger className="flex items-center gap-2 px-1">
        <span
          className={`h-2 w-2 rounded-full ${config.color} ${config.borderColor}`}
        />
        <span className="text-official-gray-400 text-xs">{config.title}</span>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          align="end"
          alignOffset={-10}
          className="m-0 max-w-[350px] p-0"
          side="bottom"
          sideOffset={10}
        >
          <Alert
            className={cn(
              'border',
              config.borderColor,
              'bg-gray-300',
              config.bgColor,
            )}
          >
            <svg
              className="size-5"
              fill="currentColor"
              height="1em"
              role="img"
              stroke="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              width="1em"
            >
              <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z" />
            </svg>
            <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
              {config.title}
            </AlertTitle>
            <AlertDescription className="mt-1 text-xs">
              {config.description}
            </AlertDescription>
          </Alert>
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
}
