import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useSetToolMcpEnabled } from '@shinkai_network/shinkai-node-state/v2/mutations/setToolMcpEnabled/useSetToolMcpEnabled';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useGetSearchTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsSearch/useGetToolsSearch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  buttonVariants,
  CopyToClipboardIcon,
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
import { useDebounce } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { TFunction } from 'i18next';
import {
  BoltIcon,
  CopyIcon,
  MoreVertical,
  Plus,
  SearchIcon,
  Trash2,
  XIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import RemoveToolButton from '../components/playground-tool/components/remove-tool-button';
import { handleConfigureClaude } from '../lib/external-clients/claude-desktop';
import { ConfigError, getDenoBinPath } from '../lib/external-clients/common';
import { handleConfigureCursor } from '../lib/external-clients/cursor';
import { useAuth } from '../store/auth';

export const MCP_SERVER_ID = 'shinkai-mcp-server';

type GetMCPCategory = 'all' | 'agent' | 'tool';

export const McpRegistryPage = () => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');
  const [dialogHelpText, setDialogHelpText] = useState('');
  const [jsonConfigToCopy, setJsonConfigToCopy] = useState('');
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customSseUrl, setCustomSseUrl] = useState('');
  const [customCommand, setCustomCommand] = useState('');
  const [selectedMCCategory, setSelectedMCCategory] =
    useState<GetMCPCategory>('all');

  const { data: toolsList, isPending } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    category: 'mcp_servers',
  });

  const filteredToolsList = useMemo(() => {
    if (selectedMCCategory === 'all') return toolsList;
    if (selectedMCCategory === 'agent') {
      return toolsList?.filter((tool) => tool.tool_type === 'Agent');
    }
    if (selectedMCCategory === 'tool') {
      return toolsList?.filter((tool) => tool.tool_type !== 'Agent');
    }
  }, [toolsList, selectedMCCategory]);

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

  const handleConfigureClick = async (
    configureFn: (serverId: string, tFunc: TFunction) => Promise<void>,
    clientName: string,
  ) => {
    try {
      await configureFn(MCP_SERVER_ID, t);
    } catch (error) {
      if (error instanceof ConfigError) {
        const jsonMatch = error.helpText.match(/```json\s*([\s\S]*?)\s*```/);
        const extractedJson = jsonMatch ? jsonMatch[1].trim() : '';

        setDialogTitle(t('mcpClients.configFailTitle', { clientName }));
        setDialogDescription(
          t('mcpClients.configFailDescription', {
            errorMessage: error.message,
          }),
        );
        setDialogHelpText(error.helpText);
        setJsonConfigToCopy(extractedJson);
        setDialogOpen(true);
      } else if (error instanceof Error) {
        toast.error(`Failed to configure ${clientName}: ${error.message}`);
      } else {
        toast.error(
          `An unknown error occurred while configuring ${clientName}.`,
        );
      }
      console.error(`Configuration error for ${clientName}:`, error);
    }
  };

  const handleShowCustomInstructions = async () => {
    // Generate SSE URL (same logic as cursor)
    const nodeUrl = auth?.node_address || 'http://localhost:9550'; // Default or get from auth
    const sseUrl = `${nodeUrl}/mcp/sse`;
    setCustomSseUrl(sseUrl);

    // Generate Command (using deno as requested, referencing the SSE URL)
    const denoBinPath = await getDenoBinPath(); // Get deno path
    const command = `${denoBinPath} run -A npm:supergateway --sse ${sseUrl}`; // Use deno
    setCustomCommand(command);

    setCustomDialogOpen(true); // Open the dialog
  };

  return (
    <div className="container">
      <div className="flex flex-col gap-1 pb-6 pt-10">
        <div className="flex justify-between gap-4">
          <h1 className="font-clash text-3xl font-medium">MCPs</h1>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Connect External MCP Client
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="p-1 px-2">
                <DropdownMenuItem
                  onClick={() =>
                    handleConfigureClick(
                      (serverId, tFunc) =>
                        handleConfigureClaude(serverId, tFunc),
                      'Claude Desktop',
                    )
                  }
                >
                  Claude Desktop
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleConfigureClick(
                      (serverId, tFunc) =>
                        handleConfigureCursor(serverId, tFunc),
                      'Cursor',
                    )
                  }
                >
                  Cursor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShowCustomInstructions}>
                  Custom
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="min-w-[100px]"
              onClick={() => {
                // navigate('/add-agent');
              }}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add MCP Server</span>
            </Button>
          </div>
        </div>
        <p className="text-official-gray-400 text-sm">
          Connect to MCP server to access external data sources <br /> and
          tools, enhancing its capabilities with real-time information.
        </p>
      </div>

      <div className="flex justify-between gap-10">
        <div className="flex flex-1 items-center justify-between gap-4">
          <div className="shadow-official-gray-950 focus-within:shadow-official-gray-700 relative flex h-10 flex-1 items-center rounded-lg shadow-[0_0_0_1px_currentColor] transition-shadow">
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
        <div className="flex justify-start">
          <ToggleGroup
            className="border-official-gray-780 flex justify-start rounded-full border bg-transparent px-0.5 py-1"
            onValueChange={(value) => {
              if (!value) return;
              setSelectedMCCategory(value as GetMCPCategory);
            }}
            type="single"
            value={selectedMCCategory}
          >
            <ToggleGroupItem
              className="data-[state=on]:bg-official-gray-850 text-official-gray-400 rounded-full bg-transparent px-6 py-2 text-xs font-medium data-[state=on]:text-white"
              key="all"
              size="sm"
              value="all"
            >
              All
            </ToggleGroupItem>
            {[
              {
                label: 'Agent',
                value: 'agent',
              },
              {
                label: 'Tool',
                value: 'tool',
              },
            ].map((tool) => (
              <ToggleGroupItem
                className="data-[state=on]:bg-official-gray-850 text-official-gray-400 rounded-full bg-transparent px-6 py-2 text-xs font-medium data-[state=on]:text-white"
                key={tool.value}
                size="sm"
                value={tool.value}
              >
                {tool.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      <div className="mx-auto flex flex-col gap-2">
        {searchQuery && isSearchQuerySynced && searchToolList?.length === 0 && (
          <div className="flex h-20 items-center justify-center">
            <p className="text-official-gray-400 text-sm">
              {t('tools.emptyState.search.text')}
            </p>
          </div>
        )}
        <div className="divide-official-gray-780 grid grid-cols-1 divide-y py-4">
          {filteredToolsList?.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <p className="text-official-gray-400 text-sm">
                No tools found in this category. Create a new tool or install
                from the App Store.
              </p>
            </div>
          ) : (
            filteredToolsList?.map((tool) => (
              <McpCard
                hideToolTypeBadge={selectedMCCategory !== 'all'}
                key={tool.tool_router_key}
                requiredConfig={(tool.config ?? []).some(
                  (config) =>
                    config.BasicConfig?.required &&
                    !config.BasicConfig?.key_value,
                )}
                toolAuthor={tool.author}
                toolDescription={tool.description}
                toolEnabled={tool.enabled}
                toolMcpEnabled={tool.mcp_enabled ?? false}
                toolName={tool.name}
                toolRouterKey={tool.tool_router_key}
                toolType={tool.tool_type === 'Agent' ? 'Agent' : 'Tool'}
              />
            ))
          )}
        </div>
        {searchQuery &&
          isSearchQuerySynced &&
          isSearchToolListSuccess &&
          searchToolList?.length > 0 && (
            <div className="divide-official-gray-780 grid grid-cols-1 divide-y py-4">
              {searchToolList?.map((tool) => (
                <McpCard
                  key={tool.tool_router_key}
                  requiredConfig={(tool.config ?? []).some(
                    (config) =>
                      config.BasicConfig?.required &&
                      !config.BasicConfig?.key_value,
                  )}
                  toolAuthor={tool.author}
                  toolDescription={tool.description}
                  toolEnabled={tool.enabled}
                  toolMcpEnabled={tool.mcp_enabled ?? false}
                  toolName={tool.name}
                  toolRouterKey={tool.tool_router_key}
                  toolType={tool.tool_type === 'Agent' ? 'Agent' : 'Tool'}
                />
              ))}
            </div>
          )}

        {(isPending || !isSearchQuerySynced || isSearchToolListPending) && (
          <div className="divide-official-gray-780 grid grid-cols-1 divide-y py-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                className={cn(
                  'grid animate-pulse items-center gap-5 rounded-sm px-2 py-3 pr-4 text-left text-sm',
                )}
                key={idx}
              >
                <div className="flex w-full flex-1 flex-col gap-3">
                  <span className="bg-official-gray-800 h-4 w-36 rounded-sm" />
                  <div className="flex flex-col gap-1">
                    <span className="bg-official-gray-800 h-3 w-full rounded-sm" />
                    <span className="bg-official-gray-800 h-3 w-2/4 rounded-sm" />
                  </div>
                </div>
                <span className="bg-official-gray-800 h-5 w-[36px] rounded-full" />
              </div>
            ))}
          </div>
        )}

        <AlertDialog onOpenChange={setDialogOpen} open={dialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {dialogDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="bg-official-gray-800 my-4 max-h-[60vh] overflow-y-auto rounded p-3 text-sm">
              <pre>
                <code>{dialogHelpText}</code>
              </pre>
            </div>
            <AlertDialogFooter className="flex justify-between gap-4">
              <AlertDialogCancel>{t('oauth.close')}</AlertDialogCancel>
              <AlertDialogAction
                disabled={!jsonConfigToCopy}
                onClick={() => {
                  if (jsonConfigToCopy) {
                    navigator.clipboard.writeText(jsonConfigToCopy);
                    toast.success(t('mcpClients.copyJsonSuccess'));
                    setDialogOpen(false);
                  }
                }}
              >
                {t('mcpClients.copyJsonButton')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog onOpenChange={setCustomDialogOpen} open={customDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('mcpClients.customTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('mcpClients.customDescriptionPrimary')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="bg-official-gray-800 relative my-2 rounded p-3">
              <pre className="mt-1 whitespace-pre-wrap text-sm">
                <code>{customSseUrl}</code>
                <CopyToClipboardIcon
                  className={cn(
                    'text-official-gray-400 absolute right-2 top-2 h-7 w-7 border border-gray-200 bg-transparent hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
                  )}
                  string={customSseUrl}
                />
              </pre>
            </div>
            <AlertDialogDescription className="mt-4">
              {t('mcpClients.customDescriptionSecondary')}
            </AlertDialogDescription>
            <div className="bg-official-gray-800 relative my-2 rounded p-3">
              <pre className="mt-1 whitespace-pre-wrap text-sm">
                <code>{customCommand}</code>
                <CopyToClipboardIcon
                  className={cn(
                    'text-official-gray-400 absolute right-2 top-2 h-7 w-7 border border-gray-200 bg-transparent hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
                  )}
                  string={customCommand}
                />
              </pre>
            </div>
            <AlertDialogFooter className="mt-4 flex justify-end gap-4">
              <AlertDialogCancel>{t('oauth.close')}</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

const McpCard = ({
  toolRouterKey,
  toolName,
  toolAuthor,
  toolDescription,
  toolMcpEnabled,
  toolEnabled,
  toolType,
  hideToolTypeBadge,
  requiredConfig,
}: {
  toolRouterKey: string;
  toolName: string;
  toolAuthor: string;
  toolDescription: string;
  toolMcpEnabled: boolean;
  toolEnabled: boolean;
  toolType: string;
  hideToolTypeBadge?: boolean;
  requiredConfig?: boolean;
}) => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const { mutateAsync: setToolMcpEnabled } = useSetToolMcpEnabled({
    onError: (error) => {
      toast.error('Failed to update MCP server mode', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-5 rounded-sm px-2 py-4 pr-4 text-left text-sm',
      )}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <Link
            className="font-medium text-white hover:underline"
            to={`/tools/${toolRouterKey}`}
          >
            {toolName}
          </Link>
          {!hideToolTypeBadge && (
            <Badge
              className="text-official-gray-300 text-xs font-normal"
              variant="outline"
            >
              {toolType}
            </Badge>
          )}
        </div>
        <p className="text-official-gray-400 line-clamp-2 text-sm">
          {toolDescription}
        </p>
        <p className="text-official-gray-400 text-xs">{toolAuthor}</p>
      </div>
      <div className="text-official-gray-400 flex items-center gap-4 text-xs">
        {requiredConfig && (
          <Link
            className={cn(
              buttonVariants({
                variant: 'outline',
                size: 'sm',
              }),
              'min-h-auto h-auto rounded-md py-2',
            )}
            to={`/tools/${toolRouterKey}`}
          >
            <BoltIcon className="mr-1.5 h-4 w-4" />
            {t('common.configure')}
          </Link>
        )}
        {!requiredConfig && (
          <Tooltip>
            <TooltipTrigger className="">
              <Switch
                checked={toolMcpEnabled}
                disabled={!toolEnabled}
                onCheckedChange={async () => {
                  if (!auth) return;
                  if (toolEnabled !== true) {
                    toast.error(
                      'Tool must be enabled before changing MCP server mode',
                    );
                    return;
                  }
                  await setToolMcpEnabled({
                    toolRouterKey: toolRouterKey,
                    mcpEnabled: !toolMcpEnabled,
                    nodeAddress: auth.node_address,
                    token: auth.api_v2_key,
                  });
                }}
              />
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent align="center" side="top">
                {toolEnabled !== true
                  ? 'Enable tool first to manage MCP Server mode'
                  : `MCP Server ${
                      toolMcpEnabled === true ? 'Enabled' : 'Disabled'
                    }`}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="size-8 p-2"
              rounded="lg"
              size="auto"
              variant="outline"
            >
              <MoreVertical className="size-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-300 p-2.5">
            <DropdownMenuItem asChild className="text-xs">
              <Link
                className={cn('min-h-auto h-auto rounded-md py-2 text-sm')}
                to={`/tools/${toolRouterKey}`}
              >
                View Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
