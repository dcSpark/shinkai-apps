import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useDeleteMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/deleteMcpServer/useDeleteMcpServer';
import type { ImportMCPServerFromGithubURLOutput } from '@shinkai_network/shinkai-node-state/v2/mutations/importMCPServerFromGithubURL/types';
import { useSetEnableMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/setEnableMcpServer/useSetEnableMcpServer';
import { useGetMcpServers } from '@shinkai_network/shinkai-node-state/v2/queries/getMcpServers/useGetMcpServers';
import {
  Badge,
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Plus, Search as SearchIcon, Trash2, X as XIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AddMcpServerModal } from '../components/mcp-servers/add-mcp-server-modal';
import { AddMcpServerWithGithubModal } from '../components/mcp-servers/add-mcp-server-with-github-modal';
import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

function DeleteServerButton({
  serverId: id,
  serverName: name,
}: {
  serverId: number;
  serverName: string;
}) {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const { mutateAsync: deleteMcpServer, isPending: isDeleting } =
    useDeleteMcpServer({
      onSuccess: () => {
        toast.success('MCP server deleted successfully');
        setIsOpen(false);
      },
      onError: (error: Error) => {
        toast.error('Failed to delete MCP server', {
          description: error?.message,
        });
      },
    });

  const handleDelete = async () => {
    if (!auth) return;

    try {
      await deleteMcpServer({
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        id,
      });
    } catch (error) {
      console.error('Failed to delete MCP server:', error);
    }
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  size: 'sm',
                }),
                'min-h-auto flex h-auto w-10 justify-center rounded-md py-2',
              )}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent align="center" side="top">
          Delete Server
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">Delete Server</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete the server &quot;{name}&quot;?
          This action cannot be undone.
        </DialogDescription>

        <DialogFooter>
          <div className="flex gap-2 pt-4">
            <DialogClose asChild className="flex-1">
              <Button
                className="min-w-[100px] flex-1"
                size="sm"
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="min-w-[100px] flex-1"
              isLoading={isDeleting}
              onClick={handleDelete}
              size="sm"
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
      toast.success('MCP server status updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update MCP server status', {
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
      console.error('Failed to update MCP server status:', error);
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
              Add Server
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsAddMcpServerModalOpen(true)}>
              Manual Setup
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsAddMcpServerWithGithubModalOpen(true)}
            >
              Add from GitHub
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      title="MCP Servers"
    >
      <div className="mx-auto flex max-w-[956px] flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              MCP Servers
            </h2>
            <p className="text-muted-foreground text-sm">
              List of MCP servers connected to your Shinkai Node
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
              <div
                className={cn(
                  'grid grid-cols-[1fr_120px_40px_115px_36px] items-center gap-5 rounded-sm px-2 py-4 pr-4 text-left text-sm',
                )}
                key={server.id}
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {server.name}{' '}
                    </span>
                    <Badge className="text-gray-80 bg-official-gray-750 text-xs font-normal">
                      {server.type}
                    </Badge>
                  </div>
                  <div className="text-official-gray-400 text-xs">
                    {server.type === 'Command' ? server.command : server.url}
                  </div>
                </div>
                <div />
                <div />
                <div>
                  <DeleteServerButton
                    serverId={server.id}
                    serverName={server.name}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <Switch
                    checked={server.is_enabled}
                    onCheckedChange={() =>
                      handleToggleEnabled(server.id, server.is_enabled)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <p className="text-official-gray-400 text-sm">
              No MCP servers found. Add a new server to get started.
            </p>
          </div>
        )}
      </div>

      <AddMcpServerModal
        initialData={initialDataForManualModal}
        isOpen={isAddMcpServerModalOpen}
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
