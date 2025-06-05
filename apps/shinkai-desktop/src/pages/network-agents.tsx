import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  SearchInput,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  PrettyJsonPrint,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  Star,
  Settings,
  Trash2,
  DollarSign,
  TrendingUp,
  Network,
  Wallet,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { useGetToolsWithOfferings } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsWithOfferings/useGetToolsWithOfferings';
import { Link } from 'react-router';
import axios from 'axios';
import { invoke } from '@tauri-apps/api/core';
import { useAuth } from '../store/auth';

export const MCP_SERVER_ID = 'shinkai-mcp-server';

export const tabTriggerClassnames = cn(
  'relative flex size-full min-w-[120px] rounded-xs p-0 pt-0.5 text-sm',
  'data-[state=active]:bg-official-gray-950 data-[state=active]:text-white data-[state=active]:shadow-[0_2px_0_0_#1a1a1d]',
  'before:absolute before:top-0 before:right-0 before:left-0 before:h-0.5',
);

export const NetworkAgentPage = () => {
  const [selectedTab, setSelectedTab] = useState<'network' | 'published'>(
    'network',
  );

  return (
    <Tabs
      className="flex size-full flex-col"
      defaultValue="network"
      onValueChange={(value) => {
        setSelectedTab(value as 'network' | 'published');
      }}
    >
      <div className="container max-w-screen-lg">
        <div className="flex flex-col gap-5 pt-10 pb-6">
          <div className="flex justify-between gap-4">
            <div className="font-clash inline-flex items-center gap-5 text-3xl font-medium">
              <h1>Network </h1>
              <TabsList className="bg-official-gray-950/80 flex h-10 w-fit items-center gap-2 rounded-full px-1 py-1">
                <TabsTrigger
                  className={cn(
                    'flex flex-col rounded-full px-4 py-1.5 text-base font-medium transition-colors',
                    'data-[state=active]:bg-official-gray-800 data-[state=active]:text-white',
                    'data-[state=inactive]:text-official-gray-400 data-[state=inactive]:bg-transparent',
                    'focus-visible:outline-hidden',
                  )}
                  value="network"
                >
                  Agents
                </TabsTrigger>
                <TabsTrigger
                  className={cn(
                    'flex flex-col rounded-full px-4 py-1.5 text-base font-medium transition-colors',
                    'data-[state=active]:bg-official-gray-800 data-[state=active]:text-white',
                    'data-[state=inactive]:text-official-gray-400 data-[state=inactive]:bg-transparent',
                    'focus-visible:outline-hidden',
                  )}
                  value="published"
                >
                  Published Agents
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <p className="text-official-gray-400 text-sm whitespace-pre-wrap">
            {selectedTab === 'network'
              ? 'Discover and deploy AI agents from the global network. Each agent operates autonomously and can be integrated into your workflows. Pay per use or deploy agents for others to access.'
              : 'Publish your AI agents to the network. Each agent operates autonomously and can be integrated into your workflows. Pay per use or deploy agents for others to access.'}
          </p>

          {selectedTab === 'network' && (
            <div className="border-official-gray-800 bg-official-gray-950/80 rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="bg-official-gray-800 rounded-full p-2">
                  <Wallet className="text-official-gray-400 h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-white">
                    Connect your wallet to access premium/paid agents
                  </h3>
                  <p className="text-official-gray-400 mt-1 text-sm">
                    {selectedTab === 'network'
                      ? 'Some agents require payment to use. Connect your wallet to access all features.'
                      : 'Publishing agents requires a connected wallet to receive payments.'}{' '}
                    <Link
                      to="/crypto-wallet"
                      className="text-official-gray-400 hover:text-official-gray-200 underline"
                    >
                      Connect your wallet to publish agents
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <TabsContent value="network">
          <DiscoverNetworkAgents />
        </TabsContent>
        <TabsContent value="published">
          <PublishedAgents />
        </TabsContent>
      </div>
      {/* <ExposeAgentDialog
        open={isExposeDialogOpen}
        onOpenChange={setIsExposeDialogOpen}
      />
      <AddNetworkAgentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      /> */}
    </Tabs>
  );
};


interface ApiPayment {
  maxAmountRequired?: string;
  extra?: { name?: string };
}

interface ApiUsageType {
  PerUse?: {
    Payment?: ApiPayment[];
  };
}

interface ApiNetworkTool {
  name?: string;
  description?: string;
  provider?: string;
  author?: string;
  tool_router_key?: string;
  usage_type?: ApiUsageType;
}

interface ApiToolOffering {
  meta_description?: string;
  usage_type?: ApiUsageType;
}

interface ApiNetworkAgent {
  network_tool?: ApiNetworkTool;
  tool_offering?: ApiToolOffering;
}

const DiscoverNetworkAgents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeView, setActiveView] = useState('explore');
  const [isExposeDialogOpen, setIsExposeDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'use-cases',
  ]);
  const [networkAgents, setNetworkAgents] = useState<Agent[]>([]);
  const auth = useAuth((state) => state.auth);
  const [installedKeys, setInstalledKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await invoke<{
          status: number;
          headers: Record<string, string[]>;
          body: string;
        }>('get_request', {
          url: 'https://storage.googleapis.com/network-agents/all_agents.json',
          customHeaders: JSON.stringify({}),
        });
        if (res.status !== 200) {
          throw new Error(`Request failed: ${res.status}`);
        }
        const data = JSON.parse(res.body) as ApiNetworkAgent[];

        const parsed = data.map((item, idx): Agent => {
          const usage =
            item.network_tool?.usage_type ?? item.tool_offering?.usage_type;
          const payment = usage?.PerUse?.Payment?.[0];

          let price = 'Free';
          if (payment?.maxAmountRequired) {
            const currency = payment.extra?.name ?? '';
            price = `${payment.maxAmountRequired} ${currency}`.trim();
          }

          return {
            id: item.network_tool?.tool_router_key ?? String(idx),
            name: item.network_tool?.name ?? 'Unknown',
            description: item.network_tool?.description ?? '',
            price,
            category: item.tool_offering?.meta_description ?? 'Network Agent',
            provider: item.network_tool?.provider ?? item.network_tool?.author,
            toolRouterKey: item.network_tool?.tool_router_key,
            apiData: item,
          };
        });

        setNetworkAgents(parsed);
      } catch (e) {
        console.error('Failed to fetch network agents', e);
      }
    };
    void fetchAgents();
  }, []);

  useEffect(() => {
    const fetchInstalled = async () => {
      if (!auth?.node_address || !auth?.api_v2_key) {
        return;
      }
      try {
        const resp = await axios.post(
          `${auth.node_address}/v2/list_all_network_shinkai_tools`,
          {},
          {
            headers: { Authorization: `Bearer ${auth.api_v2_key}` },
          },
        );
        const keys = (resp.data as { tool_router_key?: string }[])
          .map((t) => t.tool_router_key)
          .filter(Boolean) as string[];
        setInstalledKeys(new Set(keys));
      } catch (e) {
        console.error('Failed to fetch installed network tools', e);
      }
    };
    void fetchInstalled();
  }, [auth]);

  const filteredAgents = networkAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.capabilities?.some((cap) =>
        cap.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesCategory =
      selectedCategory === 'all' || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddAgent = async (agent: Agent) => {
    if (
      !auth?.node_address ||
      !auth?.api_v2_key ||
      !agent.apiData?.network_tool
    ) {
      console.error('Missing auth or agent data');
      return;
    }
    try {
      await axios.post(
        `${auth.node_address}/v2/add_shinkai_tool`,
        {
          assets: [],
          tool: {
            type: 'Network',
            content: [agent.apiData.network_tool, true],
          },
        },
        {
          headers: { Authorization: `Bearer ${auth.api_v2_key}` },
        },
      );
      setInstalledKeys((prev) => new Set(prev).add(agent.toolRouterKey ?? ''));
    } catch (e) {
      console.error('Failed to add network agent', e);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName],
    );
  };

  return (
    <div className="space-y-8">
      <SearchInput
        placeholder="Search for agents"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <h3 className="mb-4 text-lg font-semibold">
        {selectedCategory === 'all' ? 'All network agents' : selectedCategory}
      </h3>

      <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            type="discover"
            isInstalled={installedKeys.has(agent.toolRouterKey ?? '')}
            onAdd={handleAddAgent}
          />
        ))}
      </div>
    </div>
  );
};

const PublishedAgents = () => {
  const auth = useAuth((state) => state.auth);
  const { data } = useGetToolsWithOfferings({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const publishedAgents = useMemo<Agent[]>(() => {
    if (!data) return [];
    return data.map((item) => {
      const payment =
        item.tool_offering.usage_type?.PerUse?.Payment?.[0];
      const price = payment
        ? `${payment.maxAmountRequired} ${payment.extra?.name ?? ''}`
        : 'Free';
      return {
        id: item.tool_offering.tool_key,
        name: item.network_tool.name,
        description: item.network_tool.description,
        price,
        category: item.network_tool.toolkit_name ?? '',
        provider: item.network_tool.provider,
      };
    });
  }, [data]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {publishedAgents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} type="exposed" />
      ))}
    </div>
  );
};

interface Agent {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  provider?: string;
  toolRouterKey?: string;
  apiData?: ApiNetworkAgent;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  status?: string;
  requests?: number;
  revenue?: string;
  dateAdded?: string;
  capabilities?: string[];
  connectedApps?: string[];
}

interface AgentCardProps {
  agent: Agent;
  type: 'discover' | 'exposed' | 'network';
  isInstalled?: boolean;
  onAdd?: (agent: Agent) => void;
}

const AgentCard = ({ agent, type, isInstalled, onAdd }: AgentCardProps) => {
  const handleAction = () => {
    onAdd?.(agent);
  };

  const getAppLogo = (app: string) => {
    const appLogos = {
      Slack: (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-600">
          <span className="text-xs font-bold text-white">#</span>
        </div>
      ),
      'Google Sheets': (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-green-600">
          <span className="text-xs font-bold text-white">⚏</span>
        </div>
      ),
      Linear: (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
          <span className="text-xs font-bold text-white">⟶</span>
        </div>
      ),
      Notion: (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-800">
          <span className="text-xs font-bold text-white">N</span>
        </div>
      ),
      GitHub: (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900">
          <span className="text-xs font-bold text-white">⚬</span>
        </div>
      ),
      Figma: (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-pink-500">
          <span className="text-xs font-bold text-white">F</span>
        </div>
      ),
      Trello: (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500">
          <span className="text-xs font-bold text-white">T</span>
        </div>
      ),
      Discord: (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
          <span className="text-xs font-bold text-white">D</span>
        </div>
      ),
    };
    return (
      appLogos[app as keyof typeof appLogos] || (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-400">
          <span className="text-xs font-bold text-white">?</span>
        </div>
      )
    );
  };

  // Mock connected apps for demonstration
  const defaultConnectedApps = {
    'Research Paper Analyzer': ['Notion', 'Google Sheets'],
    'Smart Contract Auditor': ['GitHub', 'Slack'],
    'Personal Data Guardian': ['Linear', 'Discord'],
    'Multi-Model Orchestrator': ['Slack', 'Trello'],
    'Learning Path Designer': ['Notion', 'Google Sheets', 'Linear'],
    'Workflow Automation Engine': [
      'Slack',
      'Google Sheets',
      'Trello',
      'Linear',
    ],
    'Knowledge Synthesizer': ['Notion', 'Google Sheets', 'Slack'],
    'Code Review Assistant': ['GitHub', 'Slack', 'Linear'],
  };

  const connectedApps =
    agent.connectedApps ||
    defaultConnectedApps[agent.name as keyof typeof defaultConnectedApps] ||
    [];

  const isFreePricing =
    agent.price.toLowerCase().includes('free') || agent.price === '$0.00';

  const getTypeSpecificLabels = () => {
    switch (type) {
      case 'discover':
        return {
          priceLabel: isFreePricing ? 'Free to deploy' : 'Network access fee',
          buttonText: isInstalled ? 'Added' : 'Add',
          statusText: 'Highly rated',
        };
      case 'exposed':
        return {
          priceLabel: 'Earnings per request',
          buttonText: 'View Analytics',
          statusText: agent.status,
        };
      case 'network':
        return {
          priceLabel: 'Usage cost',
          buttonText: 'Configure Access',
          statusText: 'In your network',
        };
      default:
        return {
          priceLabel: 'access fee',
          buttonText: 'Add Agent',
          statusText: 'Available',
        };
    }
  };

  const labels = getTypeSpecificLabels();

  return (
    <Card className="bg-official-gray-900 border-official-gray-780 flex h-full flex-col border-0 transition-all duration-300 hover:shadow-xl">
      <CardHeader className="pb-3">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            {type === 'network' && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-blue-200 bg-blue-50 text-xs text-blue-700"
              >
                <Network className="h-3 w-3" />
                Connected
              </Badge>
            )}
          </div>
        </div>

        <CardTitle className="mb-2 text-lg leading-tight font-bold text-white">
          {agent.name}
        </CardTitle>
        <CardDescription className="text-official-gray-400 line-clamp-2 text-sm leading-relaxed">
          {agent.description}
        </CardDescription>

        {agent.provider && type === 'discover' && (
          <p className="text-official-gray-200 mt-2 text-sm font-medium">
            Published by {agent.provider}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4 pt-0">
        {type === 'discover' && agent.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="text-official-gray-400 text-sm font-semibold">
                {agent.rating}
              </span>
            </div>
            <span className="bg-official-gray-800 rounded-full px-2 py-1 text-xs">
              {labels.statusText}
            </span>
          </div>
        )}

        {/* Metrics for exposed type */}
        {type === 'exposed' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-green-900/30 p-3">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-600">
                  Earned this month
                </p>
                <p className="text-sm font-bold text-green-50">
                  {agent.revenue}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-official-gray-780 mt-auto space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">
                {isFreePricing ? 'Free' : agent.price}
              </span>
              {!isFreePricing && (
                <span className="text-official-gray-400 text-sm">
                  {labels.priceLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {type === 'discover' && (
              <>
                <Button
                  variant={isInstalled ? 'secondary' : 'outline'}
                  className="flex-1"
                  onClick={isInstalled ? undefined : handleAction}
                  disabled={isInstalled}
                  size="md"
                >
                  {labels.buttonText}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="md">
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent showCloseButton className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>{agent.name}</DialogTitle>
                      <DialogDescription>Agent details</DialogDescription>
                    </DialogHeader>
                    <PrettyJsonPrint json={agent.apiData ?? {}} />
                  </DialogContent>
                </Dialog>
              </>
            )}
            {type === 'exposed' && (
              <div className="flex w-full flex-col gap-2">
                <Button variant="outline" size="md" onClick={handleAction}>
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </Button>
                <Button variant="outline" size="md" onClick={handleAction}>
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            )}
            {type === 'network' && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                  onClick={handleAction}
                >
                  {labels.buttonText}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCard;
