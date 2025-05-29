import { useTranslation } from '@shinkai_network/shinkai-i18n';
import type { ImportMCPServerFromGithubURLOutput } from '@shinkai_network/shinkai-node-state/v2/mutations/importMCPServerFromGithubURL/types';
import { useSetEnableMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/setEnableMcpServer/useSetEnableMcpServer';
import { useGetMcpServers } from '@shinkai_network/shinkai-node-state/v2/queries/getMcpServers/useGetMcpServers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  CopyToClipboardIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SearchInput,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { TFunction } from 'i18next';
import { Plus, Search as SearchIcon, X as XIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { handleConfigureClaude } from '../../lib/external-clients/claude-desktop';
import { ConfigError, getDenoBinPath } from '../../lib/external-clients/common';
import { handleConfigureCursor } from '../../lib/external-clients/cursor';
import { useAuth } from '../../store/auth';
import { AddMcpServerModal } from './add-mcp-server-modal';
import { AddMcpServerWithGithubModal } from './add-mcp-server-with-github-modal';
import { McpServerCard } from './mcp-server-card';

export const MCP_SERVER_ID = 'shinkai-mcp-server';

export const McpServers = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [isAddMcpServerModalOpen, setIsAddMcpServerModalOpen] = useState(false);
  const [
    isAddMcpServerWithGithubModalOpen,
    setIsAddMcpServerWithGithubModalOpen,
  ] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialDataForManualModal, setInitialDataForManualModal] = useState<
    ImportMCPServerFromGithubURLOutput | undefined
  >(undefined);

  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customSseUrl, setCustomSseUrl] = useState('');
  const [customCommand, setCustomCommand] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');
  const [dialogHelpText, setDialogHelpText] = useState('');
  const [jsonConfigToCopy, setJsonConfigToCopy] = useState('');

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
    <>
      <div className="mx-auto flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <SearchInput
            classNames={{
              input: 'bg-transparent',
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder={t('common.searchPlaceholder')}
            value={searchQuery}
          />
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="md" variant="outline">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="min-w-[100px]" size="md">
                  <Plus className="h-4 w-4" />
                  <span>Add MCP Server</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-1.5 px-2">
                <DropdownMenuItem
                  onClick={() => setIsAddMcpServerModalOpen(true)}
                >
                  {t('mcpServers.manualSetup')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsAddMcpServerWithGithubModalOpen(true)}
                >
                  Add from GitHub
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      <AlertDialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
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
    </>
  );
};
