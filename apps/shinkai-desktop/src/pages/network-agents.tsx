import { isShinkaiIdentityLocalhost } from '@shinkai_network/shinkai-message-ts/utils';
import { useAddNetworkTool } from '@shinkai_network/shinkai-node-state/v2/mutations/addNetworkTool/useAddNetworkTool';
import { useGetInstalledNetworkTools } from '@shinkai_network/shinkai-node-state/v2/queries/getInstalledNetworkTools/useGetInstalledNetworkTools';
import { useGetToolsWithOfferings } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsWithOfferings/useGetToolsWithOfferings';
import { useGetWalletBalance } from '@shinkai_network/shinkai-node-state/v2/queries/getWalletBalance/useGetWalletBalance';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  CardFooter,
} from '@shinkai_network/shinkai-ui';
import {
  CryptoWalletIcon,
  EthereumIcon,
  USDCIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';

import {
  Settings,
  User,
  CreditCard,
  Info,
  AlertCircle,
  CheckCircle2,
  ChevronDownIcon,
  PlusIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import PublishAgentDialog from '../components/agent/publish-agent-dialog';
import {
  formatBalance,
  truncateAddress,
} from '../components/crypto-wallet/utils';
import { useGetNetworkAgents } from '../components/network/network-client';
import {
  type FormattedNetworkAgent,
  type ApiNetworkAgent,
} from '../components/network/types';
import RemoveNetworkAgentButton from '../components/network/remove-network-agent-button';
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

  const { data: walletBalance } = useGetWalletBalance(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    },
    { enabled: !!isWalletConnected },
  );

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
              <h1>Network</h1>
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

            {!isWalletConnected && (
              <Link to="/settings/crypto-wallet">
                <Button variant="outline" size="sm">
                  <CryptoWalletIcon className="size-4" />
                  Connect Wallet
                </Button>
              </Link>
            )}

            {isWalletConnected && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CryptoWalletIcon className="size-4" />
                    {truncateAddress(
                      walletInfo?.payment_wallet?.data?.address?.address_id ??
                        '',
                    )}
                    <ChevronDownIcon className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Wallet Balance</div>
                      <div className="text-official-gray-400 text-xs">
                        {walletInfo?.payment_wallet?.data?.network}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full border bg-black">
                            <EthereumIcon />
                          </div>
                          <span className="text-sm">ETH</span>
                        </div>
                        <div className="text-sm font-medium">
                          {formatBalance(
                            walletBalance?.ETH.amount ?? '0',
                            walletBalance?.ETH.decimals ?? 0,
                          )}{' '}
                          ETH
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full border bg-black">
                            <USDCIcon />
                          </div>
                          <span className="text-sm">USDC</span>
                        </div>
                        <div className="text-sm font-medium">
                          {formatBalance(
                            walletBalance?.USDC.amount ?? '0',
                            walletBalance?.USDC.decimals ?? 0,
                          )}{' '}
                          USDC
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/settings/crypto-wallet"
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'w-full',
                      )}
                    >
                      Manage Wallet
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
            )}
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

const DiscoverNetworkAgents = ({
  isIdentityRegistered,
  isWalletConnected,
}: {
  isIdentityRegistered: boolean;
  isWalletConnected: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const auth = useAuth((state) => state.auth);

  const {
    data: networkAgents,
    isPending: isNetworkAgentsPending,
    isSuccess: isNetworkAgentsSuccess,
  } = useGetNetworkAgents();

  const {
    data: installedNetworkTools,
    isPending: isInstalledNetworkToolsPending,
  } = useGetInstalledNetworkTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { mutateAsync: addNetworkTool } = useAddNetworkTool({
    onError: (error) => {
      toast.error('Failed to add network agent', {
        description: error.response?.data?.message ?? error.message,
      });
    },
    onSuccess: () => {
      toast.success('Network agent added successfully.');
    },
  });

  const filteredAgents = (networkAgents ?? [])?.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleAddAgent = async (agent: FormattedNetworkAgent) => {
    if (!auth) return;
    await addNetworkTool({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      networkTool: agent.apiData.network_tool,
    });
  };

  return (
    <div className="space-y-8">
      <SearchInput
        placeholder="Search for agents"
        classNames={{ input: 'bg-transparent' }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-2">
        {(isNetworkAgentsPending || isInstalledNetworkToolsPending) &&
          Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="border-official-gray-850 bg-official-gray-900 flex flex-col border"
            >
              <CardHeader className="pb-4">
                <div className="bg-official-gray-800 mb-1 h-6 w-3/4 animate-pulse rounded" />
                <div className="bg-official-gray-800 mb-3 h-4 w-1/2 animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="bg-official-gray-800 h-4 w-full animate-pulse rounded" />
                  <div className="bg-official-gray-800 h-4 w-2/3 animate-pulse rounded" />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="bg-official-gray-800 h-4 w-1/4 animate-pulse rounded" />
                  <div className="bg-official-gray-800 h-4 w-1/4 animate-pulse rounded" />
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <div className="bg-official-gray-800 h-9 w-full animate-pulse rounded-full" />
                <div className="bg-official-gray-800 h-9 w-full animate-pulse rounded-full" />
              </CardFooter>
            </Card>
          ))}

        {isNetworkAgentsSuccess &&
          filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              type="discover"
              isInstalled={installedNetworkTools?.some(
                (tool) => tool.tool_router_key === agent.toolRouterKey,
              )}
              onAdd={handleAddAgent}
              isIdentityRegistered={isIdentityRegistered}
              isWalletConnected={isWalletConnected}
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

  const publishedAgents = useMemo<FormattedNetworkAgent[]>(() => {
    if (!data) return [];
    return data.map((item) => {
      const payment =
        item.tool_offering.usage_type?.PerUse &&
        typeof item.tool_offering.usage_type?.PerUse === 'object' &&
        'Payment' in item.tool_offering.usage_type?.PerUse
          ? item.tool_offering.usage_type?.PerUse?.Payment?.[0]
          : undefined;
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
        <AgentCard
          key={agent.id}
          agent={agent}
          type="exposed"
          isIdentityRegistered={true}
          isWalletConnected={true}
        />
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
  agent: FormattedNetworkAgent;
  type: 'discover' | 'exposed';
  isInstalled?: boolean;
  onAdd?: (agent: FormattedNetworkAgent) => void;
  isIdentityRegistered: boolean;
  isWalletConnected: boolean;
}
/* TODO:
  - loading, error, success when adding an agent
  - refactor every server state
  - published agents
  - improve network agent in chats
*/

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

  console.log(agent);

  return (
    <Card className="border-official-gray-850 bg-official-gray-900 flex flex-col border">
      <CardHeader className="pb-4">
        <CardTitle className="mb-1 inline-flex items-center justify-between gap-2 text-lg leading-tight font-bold text-white">
          {agent.name}
          {isInstalled && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-none bg-green-800/10 text-xs text-green-500"
            >
              <CheckCircle2 className="h-3 w-3" />
              Added
            </Badge>
          )}
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
                <div className="text-lg font-semibold">
                  {isFreePricing ? 'Free' : agent.price}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="ml-auto flex w-full items-center gap-3">
          {type === 'discover' && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
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
                        {agent?.apiData?.tool_offering?.usage_type?.PerUse &&
                        typeof agent?.apiData?.tool_offering?.usage_type
                          ?.PerUse === 'object' &&
                        'Payment' in
                          agent?.apiData?.tool_offering?.usage_type?.PerUse
                          ? agent?.apiData?.tool_offering?.usage_type?.PerUse
                              ?.Payment?.[0]?.maxAmountRequired
                          : undefined}{' '}
                        {agent?.apiData?.tool_offering?.usage_type?.PerUse &&
                        typeof agent?.apiData?.tool_offering?.usage_type
                          ?.PerUse === 'object' &&
                        'Payment' in
                          agent?.apiData?.tool_offering?.usage_type?.PerUse
                          ? agent?.apiData?.tool_offering?.usage_type?.PerUse
                              ?.Payment?.[0]?.extra?.name
                          : undefined}
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
                            {agent?.apiData?.tool_offering?.usage_type
                              ?.PerUse &&
                            typeof agent?.apiData?.tool_offering?.usage_type
                              ?.PerUse === 'object' &&
                            'Payment' in
                              agent?.apiData?.tool_offering?.usage_type?.PerUse
                              ? agent?.apiData?.tool_offering?.usage_type
                                  ?.PerUse?.Payment?.[0]?.network
                              : undefined}
                          </span>
                        </div>
                        <div className="flex justify-between border-b py-2">
                          <span className="text-official-gray-400">
                            Payment recipient
                          </span>
                          <span className="inline-flex items-center gap-2 font-mono">
                            {truncateAddress(
                              agent?.apiData?.tool_offering?.usage_type
                                ?.PerUse &&
                                typeof agent?.apiData?.tool_offering?.usage_type
                                  ?.PerUse === 'object' &&
                                'Payment' in
                                  agent?.apiData?.tool_offering?.usage_type
                                    ?.PerUse
                                ? (agent?.apiData?.tool_offering?.usage_type
                                    ?.PerUse?.Payment?.[0]?.payTo ?? '')
                                : '',
                            )}
                            <CopyToClipboardIcon
                              className="ml-2 h-4 w-4"
                              string={
                                agent?.apiData?.tool_offering?.usage_type
                                  ?.PerUse &&
                                typeof agent?.apiData?.tool_offering?.usage_type
                                  ?.PerUse === 'object' &&
                                'Payment' in
                                  agent?.apiData?.tool_offering?.usage_type
                                    ?.PerUse
                                  ? (agent?.apiData?.tool_offering?.usage_type
                                      ?.PerUse?.Payment?.[0]?.payTo ?? '')
                                  : ''
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
                            {agent?.apiData?.tool_offering?.usage_type
                              ?.PerUse &&
                            typeof agent?.apiData?.tool_offering?.usage_type
                              ?.PerUse === 'object' &&
                            'Payment' in
                              agent?.apiData?.tool_offering?.usage_type?.PerUse
                              ? agent?.apiData?.tool_offering?.usage_type
                                  ?.PerUse?.Payment?.[0]?.network
                              : undefined}{' '}
                            network.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isInstalled ? (
                    <DialogFooter className="flex-col gap-3 sm:flex-row">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button size="sm" className="w-full sm:w-auto">
                        Add Agent
                      </Button>
                    </DialogFooter>
                  ) : (
                    <DialogFooter>
                      <RemoveNetworkAgentButton
                        asChild
                        toolRouterKey={agent.toolRouterKey}
                      >
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          Remove Agent
                        </Button>
                      </RemoveNetworkAgentButton>
                    </DialogFooter>
                  )}
                </DialogContent>
              </Dialog>
              {!isInstalled ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleAction}
                  size="sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Agent
                </Button>
              ) : (
                <RemoveNetworkAgentButton toolRouterKey={agent.toolRouterKey} />
              )}
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
