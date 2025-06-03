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
import { useMemo, useState } from 'react';
import { Link } from 'react-router';

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
                    {selectedTab === 'network'
                      ? 'Connect your wallet to access premium/paid agents'
                      : null}
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

const myExposedAgents = [
  {
    id: '1',
    name: 'Knowledge Synthesizer',
    description:
      'Advanced knowledge extraction and synthesis from documents, accessible to other network participants',
    price: '$15.00 per request',
    category: 'Knowledge Management',
    status: 'active',
    requests: 1247,
    revenue: '$1,855.00',
    connectedApps: ['Notion', 'Google Sheets', 'Slack'],
  },
  {
    id: '2',
    name: 'Code Review Assistant',
    description:
      'Automated code review and suggestions with security analysis, monetized through network usage',
    price: '$8.00 per request',
    category: 'Development',
    status: 'active',
    requests: 892,
    revenue: '$7,136.00',
    connectedApps: ['GitHub', 'Slack', 'Linear'],
  },
];

const discoveredAgents = [
  {
    id: '3',
    name: 'Research Paper Analyzer',
    description: 'Extracts insights and summaries from academic papers',
    price: 'Free',
    category: 'Knowledge Management',
    provider: 'ResearchAI',
    rating: 4.8,
    reviews: 156,
    featured: true,
    capabilities: ['PDF Analysis', 'Citation Extraction', 'Summary Generation'],
    connectedApps: ['Notion', 'Google Sheets'],
  },
  {
    id: '4',
    name: 'Smart Contract Auditor',
    description: 'AI-powered smart contract security analysis and optimization',
    price: '$45.00',
    category: 'Blockchain & Web3',
    provider: 'Web3Security',
    rating: 4.9,
    reviews: 203,
    featured: false,
    capabilities: [
      'Security Analysis',
      'Gas Optimization',
      'Vulnerability Detection',
    ],
    connectedApps: ['GitHub', 'Slack'],
  },
  {
    id: '5',
    name: 'Personal Data Guardian',
    description: 'Privacy-first personal data management and encryption',
    price: '$30.00',
    category: 'Privacy & Security',
    provider: 'PrivacyPro',
    rating: 4.7,
    reviews: 89,
    featured: true,
    capabilities: ['Data Encryption', 'Privacy Analysis', 'Access Control'],
    connectedApps: ['Linear', 'Discord'],
  },
  {
    id: '6',
    name: 'Multi-Model Orchestrator',
    description: 'Coordinates multiple AI models for complex tasks',
    price: '$20.00',
    category: 'AI Coordination',
    provider: 'ModelMesh',
    rating: 4.6,
    reviews: 134,
    featured: false,
    capabilities: ['Model Routing', 'Task Decomposition', 'Result Synthesis'],
    connectedApps: ['Slack', 'Trello'],
  },
  {
    id: '7',
    name: 'Learning Path Designer',
    description: 'Creates personalized learning curricula and tracks progress',
    price: 'Free',
    category: 'Education & Training',
    provider: 'EduAI',
    rating: 4.8,
    reviews: 267,
    featured: true,
    capabilities: [
      'Curriculum Design',
      'Progress Tracking',
      'Adaptive Learning',
    ],
    connectedApps: ['Notion', 'Google Sheets', 'Linear'],
  },
  {
    id: '8',
    name: 'Workflow Automation Engine',
    description: 'Automates complex business processes and workflows',
    price: '$35.00',
    category: 'Productivity',
    provider: 'FlowAI',
    rating: 4.5,
    reviews: 198,
    featured: false,
    capabilities: [
      'Process Mining',
      'Task Automation',
      'Integration Management',
    ],
    connectedApps: ['Slack', 'Google Sheets', 'Trello', 'Linear', 'Figma'],
  },
];

const DiscoverNetworkAgents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeView, setActiveView] = useState('explore');
  const [isExposeDialogOpen, setIsExposeDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'use-cases',
  ]);

  const filteredAgents = discoveredAgents.filter((agent) => {
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
          <AgentCard key={agent.id} agent={agent} type="discover" />
        ))}
      </div>
    </div>
  );
};

const PublishedAgents = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {myExposedAgents.map((agent) => (
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
}

const AgentCard = ({ agent, type }: AgentCardProps) => {
  const handleAction = () => {
    console.log(`Action for agent ${agent.id} of type ${type}`);
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
          buttonText: 'Add Agent',
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
              <Button
                // className="hover:from-brand hover:to-brand-500 to-brand flex-1 border-0 bg-linear-to-r from-orange-200 via-red-400 font-medium text-white"
                variant="outline"
                className="w-full"
                onClick={handleAction}
                size="md"
              >
                {labels.buttonText}
              </Button>
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
