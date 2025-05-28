import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import type { McpServer } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import type { McpServerTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useDeleteMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/deleteMcpServer/useDeleteMcpServer';
import { useGetMCPServerTools } from '@shinkai_network/shinkai-node-state/v2/queries/getMCPServerTools/useGetMCPServerTool';
import {
  Badge,
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { ToolsIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BoltIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth';
import { AddMcpServerModal } from './add-mcp-server-modal';

interface McpServerCardProps {
  server: McpServer;
  onToggleEnabled: (serverId: number, currentEnabled: boolean) => Promise<void>;
}

export const McpServerCard = ({ server, onToggleEnabled }: McpServerCardProps) => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToolsDialogOpen, setIsToolsDialogOpen] = useState(false);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const { data: mcpServerTools } = useGetMCPServerTools({
    nodeAddress: auth?.node_address || '',
    token: auth?.api_v2_key || '',
    mcpServerId: server.id,
  });

  const { mutateAsync: deleteMcpServer, isPending: isDeleting } =
    useDeleteMcpServer({
      onSuccess: () => {
        toast.success('MCP server deleted successfully');
        setIsDeleteDialogOpen(false);
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
        id: server.id,
      });
    } catch (error) {
      console.error('Failed to delete MCP server:', error);
    }
  };

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-[1fr_auto_min-content_min-content_auto] items-center gap-5 rounded-sm px-2 py-4 pr-4 text-left text-sm',
        )}
        key={server.id} // key is typically used in the parent map, but won't harm here
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
        <div className="flex items-center justify-center">
          <Dialog onOpenChange={setIsToolsDialogOpen} open={isToolsDialogOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Badge
                    className="text-gray-80 bg-official-gray-750 hover:bg-official-gray-700 cursor-pointer px-3 py-2 text-xs font-normal transition-colors"
                    onClick={() => setIsToolsDialogOpen(true)}
                  >
                    <ToolsIcon className="mr-2 size-4 text-white" />
                    {mcpServerTools && mcpServerTools.length > 99
                      ? '99+'
                      : mcpServerTools?.length || '0'}{' '}
                    tools
                  </Badge>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent align="center" side="top">
                View Available Tools
              </TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tools for {server.name}</DialogTitle>
                <DialogDescription>
                  List of tools available from this MCP server.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto py-4">
                {mcpServerTools && mcpServerTools.length > 0 ? (
                  <ul className="space-y-2">
                    {mcpServerTools.map((tool: McpServerTool) => (
                      <li className="text-sm" key={tool.id}>
                        {tool.tool_router_key ? (
                          <Link
                            className="text-official-green-400 hover:text-official-green-300 hover:underline"
                            onClick={() => setIsToolsDialogOpen(false)}
                            to={`/tools/${tool.tool_router_key}`}
                          >
                            {tool.name}
                          </Link>
                        ) : (
                          <span className="text-official-gray-100">{tool.name}</span>
                        )}
                        {tool.description && (
                          <p className="text-xs text-official-gray-500">
                            {tool.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">
                    No tools available for this server.
                  </p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                  }),
                  'min-h-auto flex h-auto w-10 justify-center rounded-md py-2',
                )}
                onClick={() => setIsConfigureModalOpen(true)}
              >
                <BoltIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent align="center" side="top">
              Configure Server
            </TooltipContent>
          </Tooltip>
        </div>
        <div>
          <Dialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
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
                Are you sure you want to delete the server &quot;{server.name}&quot;?
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
        </div>
        <div className="flex items-center justify-center">
          <Switch
            checked={server.is_enabled}
            onCheckedChange={() =>
              onToggleEnabled(server.id, server.is_enabled)
            }
          />
        </div>
      </div>
      <AddMcpServerModal
        initialData={server}
        isOpen={isConfigureModalOpen}
        mode="Update"
        onClose={() => setIsConfigureModalOpen(false)}
        onSuccess={() => {
          setIsConfigureModalOpen(false);
        }}
      />
    </>
  );
};
