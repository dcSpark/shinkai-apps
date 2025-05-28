import { useTranslation } from '@shinkai_network/shinkai-i18n';
import type { ImportMCPServerFromGithubURLOutput } from '@shinkai_network/shinkai-node-state/v2/mutations/importMCPServerFromGithubURL/types';
import { useSetEnableMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/setEnableMcpServer/useSetEnableMcpServer';
import { useGetMcpServers } from '@shinkai_network/shinkai-node-state/v2/queries/getMcpServers/useGetMcpServers';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from '@shinkai_network/shinkai-ui';
import { Plus, Search as SearchIcon, X as XIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AddMcpServerModal } from '../components/mcp-servers/add-mcp-server-modal';
import { AddMcpServerWithGithubModal } from '../components/mcp-servers/add-mcp-server-with-github-modal';
import { McpServerCard } from '../components/mcp-servers/mcp-server-card';
import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

export const McpServers = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [isAddMcpServerModalOpen, setIsAddMcpServerModalOpen] = useState(false);
  const [isAddMcpServerWithGithubModalOpen, setIsAddMcpServerWithGithubModalOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialDataForManualModal, setInitialDataForManualModal] = 
    useState<ImportMCPServerFromGithubURLOutput | undefined>(undefined);

  const { data: mcpServers, isLoading } = useGetMcpServers({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { mutateAsync: setEnableMcpServer } = useSetEnableMcpServer({
    onSuccess: () => {
      toast.success(t('mcpServers.statusUpdated'));
    },
    onError: (error: Error) => {
      toast.error(t('mcpServers.statusUpdateFailed'), {
        description: error?.message,
      });
    },
  });

  const handleToggleEnabled = async (
    serverId: number,
    currentEnabled: boolean,
  ) => {
    if (!auth) return;

    try {
      await setEnableMcpServer({
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        mcpServerId: serverId,
        isEnabled: !currentEnabled,
      });
    } catch (error) {
      toast.error(t('mcpServers.statusUpdateFailed'), {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const filteredServers = mcpServers?.filter(
    (server) =>
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SimpleLayout
      headerRightElement={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('mcpServers.add')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsAddMcpServerModalOpen(true)}>
              {t('mcpServers.manualSetup')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsAddMcpServerWithGithubModalOpen(true)}
            >
              Add from GitHub
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      title={t('mcpServers.title')}
    >
      <div className="mx-auto flex max-w-[956px] flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {t('mcpServers.title')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('mcpServers.listDescription')}
            </p>
          </div>
          <div className="shadow-official-gray-950 focus-within:shadow-official-gray-700 relative flex h-10 items-center rounded-lg shadow-[0_0_0_1px_currentColor] transition-shadow">
            <Input
              className="placeholder-gray-80 bg-official-gray-900 !h-full border-none py-2 pl-10"
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder={t('common.searchPlaceholder')}
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
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="grid w-full animate-pulse grid-cols-[1fr_120px_40px_115px_36px] gap-5">
              {[...Array(3)].map((_, i) => (
                <div className="contents" key={i}>
                  <div className="bg-official-gray-750 h-12 rounded" />
                  <div className="bg-official-gray-750 h-12 rounded" />
                  <div className="bg-official-gray-750 h-12 rounded" />
                  <div className="bg-official-gray-750 h-12 rounded" />
                  <div className="bg-official-gray-750 h-12 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredServers && filteredServers.length > 0 ? (
          <div className="divide-official-gray-780 grid max-h-[calc(100vh-300px)] grid-cols-1 divide-y overflow-y-auto py-4">
            {filteredServers.map((server) => (
              <McpServerCard 
                key={server.id} 
                onToggleEnabled={handleToggleEnabled} 
                server={server} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <p className="text-official-gray-400 text-sm">
              {t('mcpServers.noServersFound')}
            </p>
          </div>
        )}
      </div>

      <AddMcpServerModal
        initialData={initialDataForManualModal}
        isOpen={isAddMcpServerModalOpen}
        mode="Create"
        onClose={() => {
          setIsAddMcpServerModalOpen(false);
          setInitialDataForManualModal(undefined);
        }}
        onSuccess={() => {
          setIsAddMcpServerModalOpen(false);
          setInitialDataForManualModal(undefined);
        }}
      />
      <AddMcpServerWithGithubModal
        isOpen={isAddMcpServerWithGithubModalOpen}
        onClose={() => setIsAddMcpServerWithGithubModalOpen(false)}
        onSuccess={(data) => {
          setIsAddMcpServerWithGithubModalOpen(false);
          setInitialDataForManualModal(data);
          setIsAddMcpServerModalOpen(true);
        }}
      />
    </SimpleLayout>
  );
};
