import { isShinkaiIdentityLocalhost } from '@shinkai_network/shinkai-message-ts/utils';
import { useGetToolsWithOfferings } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsWithOfferings/useGetToolsWithOfferings';
import { useGetWalletList } from '@shinkai_network/shinkai-node-state/v2/queries/getWalletList/useGetWalletList';
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
  DialogFooter,
  Alert,
  AlertTitle,
  AlertDescription,
  buttonVariants,
  CopyToClipboardIcon,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { invoke } from '@tauri-apps/api/core';
import axios from 'axios';
import {
  Settings,
  Network,
  User,
  CreditCard,
  Info,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import PublishAgentDialog from '../components/agent/publish-agent-dialog';
import { truncateAddress } from '../components/chat/message-extra';
import { useAuth } from '../store/auth';

export const MCP_SERVER_ID = 'shinkai-mcp-server';

export const NetworkAgentPage = () => {
  const [selectedTab, setSelectedTab] = useState<'network' | 'published'>(
    'network',
  );

  const auth = useAuth((state) => state.auth);
  const { data: walletInfo } = useGetWalletList({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const isWalletConnected =
    walletInfo?.payment_wallet || walletInfo?.receiving_wallet;

  const isIdentityRegistered = !isShinkaiIdentityLocalhost(
    auth?.shinkai_identity ?? '',
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
        </div>
        {(!isWalletConnected || !isIdentityRegistered) && (
          <SetupGuide
            isWalletConnected={!!isWalletConnected}
            isIdentityRegistered={isIdentityRegistered}
          />
        )}
        <TabsContent value="network">
          <DiscoverNetworkAgents
            isIdentityRegistered={isIdentityRegistered}
            isWalletConnected={!!isWalletConnected}
          />
        </TabsContent>
        <TabsContent value="published" className="space-y-4">
          <div className="flex justify-end">
            <PublishAgentDialog />
          </div>
          <PublishedAgents />
        </TabsContent>
      </div>

      {/* <AddNetworkAgentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />  */}
    </Tabs>
  );
};

interface ApiPayment {
  maxAmountRequired?: string;
  extra?: {
    name?: string;
    version?: string;
  };
  asset?: string;
  description?: string;
  maxTimeoutSeconds?: number;
  mimeType?: string;
  network?: string;
  outputSchema?: Record<string, any>;
  payTo?: string;
  resource?: string;
  scheme?: string;
}

interface ApiUsageType {
  PerUse?: {
    Payment?: ApiPayment[];
  };
}

interface ApiNetworkTool {
  activated?: boolean;
  author: string;
  config?: Record<string, any>[];
  description?: string;
  input_args?: Record<string, any>;
  mcp_enabled?: boolean;
  name?: string;
  output_arg: {
    json: string;
  };
  restrictions?: string;
  provider?: string;
  tool_router_key?: string;
  usage_type?: ApiUsageType;
  version?: string;
}

interface ApiToolOffering {
  meta_description?: string;
  usage_type?: ApiUsageType;
}

interface ApiNetworkAgent {
  network_tool?: ApiNetworkTool;
  tool_offering?: ApiToolOffering;
}

const DiscoverNetworkAgents = ({
  isIdentityRegistered,
  isWalletConnected,
}: {
  isIdentityRegistered: boolean;
  isWalletConnected: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState('');

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
        const resp = await axios.get(
          `${auth.node_address}/v2/list_all_network_shinkai_tools`,
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
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
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

  return (
    <div className="space-y-8">
      <SearchInput
        placeholder="Search for agents"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-2">
        {[...filteredAgents, ...filteredAgents, ...filteredAgents].map(
          (agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              type="discover"
              isInstalled={installedKeys.has(agent.toolRouterKey ?? '')}
              onAdd={handleAddAgent}
              isIdentityRegistered={isIdentityRegistered}
              isWalletConnected={isWalletConnected}
            />
          ),
        )}
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
      const payment = item.tool_offering.usage_type?.PerUse?.Payment?.[0];
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
  provider: string;
  toolRouterKey: string;
  apiData?: ApiNetworkAgent;
}

interface AgentCardProps {
  agent: Agent;
  type: 'discover' | 'exposed' | 'network';
  isInstalled?: boolean;
  onAdd?: (agent: Agent) => void;
  isIdentityRegistered: boolean;
  isWalletConnected: boolean;
}

const AgentCard = ({
  agent,
  type,
  isInstalled,
  onAdd,
  isIdentityRegistered,
  isWalletConnected,
}: AgentCardProps) => {
  const handleAction = () => {
    onAdd?.(agent);
  };

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
          statusText: 'In your network',
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
    <Card className="border-official-gray-850 bg-official-gray-900 flex flex-col border">
      <CardHeader className="pb-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            {type === 'network' && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-cyan-200 bg-cyan-50 text-xs text-cyan-700"
              >
                <Network className="h-3 w-3" />
                Connected
              </Badge>
            )}
          </div>
        </div>

        <CardTitle className="mb-1 inline-flex items-center gap-2 text-lg leading-tight font-bold text-white">
          {agent.name}
          <Badge variant="outline" className="text-xs">
            v{agent.apiData?.network_tool?.version}
          </Badge>
        </CardTitle>

        {agent.provider && type === 'discover' && (
          <div className="text-official-gray-400 mb-3 flex items-center gap-2 text-sm">
            <User className="h-3 w-3" />
            <span>{agent.provider}</span>
          </div>
        )}
        <CardDescription className="text-official-gray-400 line-clamp-2 text-sm leading-relaxed">
          {agent.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4 pt-0">
        {type === 'discover' && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-official-gray-400 flex items-center gap-1 text-sm">
                <CreditCard className="h-4 w-4" />
                <span>Cost per use</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">{agent.price}</div>
                <div className="text-official-gray-400 text-xs">
                  on Base Sepolia
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {type === 'discover' && (
            <>
              <Button
                variant={isInstalled ? 'default' : 'outline'}
                className="flex-1"
                onClick={isInstalled ? undefined : handleAction}
                disabled={isInstalled}
                size="md"
              >
                {labels.buttonText}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="md" className="flex-1">
                    Details
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton
                  className="max-h-[80vh] max-w-xl overflow-y-auto"
                >
                  <DialogHeader>
                    <DialogTitle className="text-xl">{agent?.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                      <Badge variant="outline" className="font-normal">
                        v{agent?.apiData?.network_tool?.version}
                      </Badge>
                      <span className="text-sm">
                        by {agent?.apiData?.network_tool?.author}
                      </span>
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <p>{agent?.apiData?.network_tool?.description}</p>

                    {(!isWalletConnected || !isIdentityRegistered) && (
                      <SetupGuide
                        isWalletConnected={!!isWalletConnected}
                        isIdentityRegistered={isIdentityRegistered}
                      />
                    )}
                    <div className="flex justify-between py-2">
                      <span className="text-official-gray-400 text-sm">
                        Tool Router Key
                      </span>
                      <span className="font-mono text-xs">
                        {agent?.toolRouterKey}
                      </span>
                    </div>

                    <div className="bg-official-gray-850 flex items-center justify-between rounded-md p-3">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Cost per use</p>
                          <p className="text-official-gray-400 text-sm">
                            Pay each time you use this agent
                          </p>
                        </div>
                      </div>
                      <Badge className="py-1.5 text-lg">
                        {
                          agent?.apiData?.tool_offering?.usage_type?.PerUse
                            ?.Payment?.[0]?.maxAmountRequired
                        }{' '}
                        {
                          agent?.apiData?.tool_offering?.usage_type?.PerUse
                            ?.Payment?.[0]?.extra?.name
                        }
                      </Badge>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">Payment Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b py-2">
                          <span className="text-official-gray-400">
                            Network
                          </span>
                          <span>
                            {
                              agent?.apiData?.tool_offering?.usage_type?.PerUse
                                ?.Payment?.[0]?.network
                            }
                          </span>
                        </div>
                        <div className="flex justify-between border-b py-2">
                          <span className="text-official-gray-400">
                            Payment recipient
                          </span>
                          <span className="inline-flex items-center gap-2 font-mono">
                            {truncateAddress(
                              agent?.apiData?.tool_offering?.usage_type?.PerUse
                                ?.Payment?.[0]?.payTo ?? '',
                            )}
                            <CopyToClipboardIcon
                              className="ml-2 h-4 w-4"
                              string={
                                agent?.apiData?.tool_offering?.usage_type
                                  ?.PerUse?.Payment?.[0]?.payTo ?? ''
                              }
                            />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-cyan-800 bg-cyan-900/10 p-3">
                      <div className="flex gap-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                        <div>
                          <p className="text-sm font-medium text-cyan-400">
                            How payments work
                          </p>
                          <p className="text-official-gray-400 text-sm">
                            When you use this agent, you'll be prompted to
                            confirm the payment from your connected wallet.
                            Payments are processed on the{' '}
                            {
                              agent?.apiData?.tool_offering?.usage_type?.PerUse
                                ?.Payment?.[0]?.network
                            }{' '}
                            network.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex-col gap-3 sm:flex-row">
                    <Button
                      variant="outline"
                      // onClick={onClose}
                      size="md"
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="md"
                      // onClick={onAdd}
                      // disabled={!canAddAgent}
                      className="w-full sm:w-auto"
                    >
                      Add Agent
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          {type === 'exposed' && (
            <div className="flex w-full flex-col gap-3">
              <Button variant="outline" size="md" onClick={handleAction}>
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCard;

interface SetupGuideProps {
  isWalletConnected: boolean;
  isIdentityRegistered: boolean;
}
function SetupGuide({
  isWalletConnected,
  isIdentityRegistered,
}: SetupGuideProps) {
  const auth = useAuth((state) => state.auth);

  return (
    <Alert variant="warning" className="mb-6 border-0 bg-yellow-300/5 p-6">
      <div className="flex flex-col gap-4">
        <AlertTitle className="text-base font-semibold text-white">
          Setup required to use paid agents
        </AlertTitle>
        <AlertDescription>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                {isIdentityRegistered ? (
                  <CheckCircle2 className="mt-0.5 size-4 text-green-500" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 text-yellow-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    Register Shinkai Identity
                  </p>
                  <p className="text-official-gray-200 text-sm">
                    Create your unique identity on the Shinkai network to use
                    and publish agents
                  </p>
                </div>
              </div>
              {!isIdentityRegistered && (
                <a
                  href={`https://shinkai-contracts.pages.dev?encryption_pk=${auth?.encryption_pk}&signature_pk=${auth?.identity_pk}&node_address=${auth?.node_address}`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'md' }),
                    'bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Register Identity
                </a>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                {isWalletConnected ? (
                  <CheckCircle2 className="mt-0.5 size-4 text-green-500" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 text-yellow-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    Connect Crypto Wallet
                  </p>
                  <p className="text-official-gray-200 text-sm">
                    Connect your wallet to pay for agent usage and receive
                    earnings from your published agents
                  </p>
                </div>
              </div>
              {!isWalletConnected && (
                <Link
                  to="/settings/crypto-wallet"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'md' }),
                    'bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black',
                  )}
                >
                  Connect Wallet
                </Link>
              )}
            </div>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
