import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useSetToolMcpEnabled } from '@shinkai_network/shinkai-node-state/v2/mutations/setToolMcpEnabled/useSetToolMcpEnabled';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import {
  Badge,
  buttonVariants,
  SearchInput,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BoltIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { McpServers } from '../components/mcp-servers/mcp-servers';
import { useAuth } from '../store/auth';

export const MCP_SERVER_ID = 'shinkai-mcp-server';

type GetMCPCategory = 'all' | 'agent' | 'tool';

export const tabTriggerClassnames = cn(
  'rounded-xs relative flex size-full min-w-[120px] p-0 pt-0.5 text-sm',
  'data-[state=active]:bg-official-gray-950 data-[state=active]:text-white data-[state=active]:shadow-[0_2px_0_0_#1a1a1d]',
  'before:absolute before:left-0 before:right-0 before:top-0 before:h-0.5',
);

export const McpRegistryPage = () => {
  const [selectedTab, setSelectedTab] = useState<
    'mcp_servers' | 'expose_tools'
  >('mcp_servers');

  return (
    <Tabs
      className="flex size-full flex-col"
      defaultValue="mcp_servers"
      onValueChange={(value) => {
        setSelectedTab(value as 'mcp_servers' | 'expose_tools');
      }}
    >
      <div className="container max-w-screen-lg">
        <div className="flex flex-col gap-3 pb-6 pt-10">
          <div className="flex justify-between gap-4">
            <div className="font-clash inline-flex items-center gap-4 text-3xl font-medium">
              <h1>MCPs</h1>
              <TabsList className="bg-official-gray-950/80 flex h-10 w-fit items-center gap-2 rounded-full px-1 py-1">
                <TabsTrigger
                  className={cn(
                    'rounded-full px-4 py-1.5 text-base font-medium transition-colors',
                    'data-[state=active]:bg-official-gray-800 data-[state=active]:text-white',
                    'data-[state=inactive]:text-official-gray-400 data-[state=inactive]:bg-transparent',
                    'focus-visible:outline-none',
                  )}
                  value="mcp_servers"
                >
                  MCP Servers
                </TabsTrigger>
                <TabsTrigger
                  className={cn(
                    'rounded-full px-4 py-1.5 text-base font-medium transition-colors',
                    'data-[state=active]:bg-official-gray-800 data-[state=active]:text-white',
                    'data-[state=inactive]:text-official-gray-400 data-[state=inactive]:bg-transparent',
                    'focus-visible:outline-none',
                  )}
                  value="expose_tools"
                >
                  Expose Tools
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <p className="text-official-gray-400 whitespace-pre-wrap text-sm">
            {selectedTab === 'mcp_servers'
              ? 'Connect to MCP server to access external data sources  and tools,  enhancing \nits capabilities with real-time information.'
              : 'Expose your AI Tools through MCP to enable seamless integration with other MCP Clients \nand expand their capabilities.'}
          </p>
        </div>
        <TabsContent value="mcp_servers">
          <McpServers />
        </TabsContent>
        <TabsContent value="expose_tools">
          <ExposeToolsAsMcp />
        </TabsContent>
      </div>
    </Tabs>
  );
};

const ExposeToolsAsMcp = () => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const [selectedMCCategory, setSelectedMCCategory] =
    useState<GetMCPCategory>('all');

  const [searchQuery, setSearchQuery] = useState('');

  const { data: toolsList, isPending } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    category: 'mcp_servers',
  });

  const filteredToolsList = useMemo(() => {
    let filtered = toolsList;

    if (selectedMCCategory === 'agent') {
      filtered = filtered?.filter((tool) => tool.tool_type === 'Agent');
    } else if (selectedMCCategory === 'tool') {
      filtered = filtered?.filter((tool) => tool.tool_type !== 'Agent');
    }

    if (searchQuery) {
      filtered = filtered?.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [toolsList, selectedMCCategory, searchQuery]);

  return (
    <>
      <div className="flex justify-between gap-10">
        <div className="flex flex-1 items-center justify-between gap-4">
          <SearchInput
            classNames={{
              input: 'bg-transparent',
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            value={searchQuery}
          />
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
              className="data-[state=on]:bg-official-gray-850 text-official-gray-400 rounded-full bg-transparent px-5 py-1.5 text-xs font-medium data-[state=on]:text-white"
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
                className="data-[state=on]:bg-official-gray-850 text-official-gray-400 rounded-full bg-transparent px-5 py-1.5 text-xs font-medium data-[state=on]:text-white"
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

        {isPending && (
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
      </div>
    </>
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
      </div>
    </div>
  );
};
