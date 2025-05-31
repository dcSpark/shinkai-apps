import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { type McpServer } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import { useDeleteMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/deleteMcpServer/useDeleteMcpServer';
import { useGetMCPServerTools } from '@shinkai_network/shinkai-node-state/v2/queries/getMCPServerTools/useGetMCPServerTool';
import {
  Badge,
  Button,
  buttonVariants,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { ToolsIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BoltIcon, ChevronDown, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth';
import { AddMcpServerModal } from './add-mcp-server-modal';

interface McpServerCardProps {
  server: McpServer;
  onToggleEnabled: (serverId: number, currentEnabled: boolean) => Promise<void>;
}

export const McpServerCard = ({
  server,
  onToggleEnabled,
}: McpServerCardProps) => {
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
        toast.success(t('mcpServers.deleteSuccess'));
        setIsDeleteDialogOpen(false);
      },
      onError: (error: Error) => {
        toast.error(t('mcpServers.deleteFailed'), {
          description: error?.message,
        });
      },
    });

  const handleDelete = async () => {
    if (!auth) return;

    await deleteMcpServer({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      id: server.id,
    });
  };

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-[1fr_120px_40px_auto] items-center gap-5 rounded-xs px-2 py-4 pr-4 text-left text-sm',
        )}
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {server.name}{' '}
            </span>
            <Badge
              className="text-official-gray-300 text-xs font-normal"
              variant="outline"
            >
              {server.type}
            </Badge>
          </div>
          <div className="text-official-gray-400 text-xs">
            {server.type === 'Command' ? server.command : server.url}
          </div>
        </div>
        {mcpServerTools && mcpServerTools.length > 0 ? (
          <div className="flex items-center justify-center">
            <Dialog
              onOpenChange={setIsToolsDialogOpen}
              open={isToolsDialogOpen}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Badge
                      className={cn(
                        buttonVariants({
                          variant: 'outline',
                          size: 'xs',
                        }),
                        'cursor-pointer',
                      )}
                      onClick={() => setIsToolsDialogOpen(true)}
                    >
                      <ToolsIcon className="mr-2 size-4 text-white" />
                      {mcpServerTools && mcpServerTools.length > 99
                        ? '99+'
                        : mcpServerTools?.length || '0'}{' '}
                      {t('mcpServers.tools')}
                    </Badge>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent align="center" side="top">
                  {t('mcpServers.viewAvailableTools')}
                </TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-xl" showCloseButton>
                <DialogHeader>
                  <DialogTitle>
                    {t('mcpServers.toolsFor', { name: server.name })}
                  </DialogTitle>
                  <DialogDescription>
                    {t('mcpServers.listOfToolsAvailableFromThisMcpServer')}
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto py-1">
                  {mcpServerTools && mcpServerTools.length > 0 ? (
                    <ul className="space-y-3">
                      {mcpServerTools.map((tool) => (
                        <li
                          className="border-official-gray-780 bg-official-gray-900 rounded-lg border p-3 py-2.5 text-sm"
                          key={tool.id}
                        >
                          <div>
                            {tool.tool_router_key ? (
                              <Link
                                className="text-white hover:underline"
                                onClick={() => setIsToolsDialogOpen(false)}
                                to={`/tools/${tool.tool_router_key}`}
                              >
                                {tool.name}
                              </Link>
                            ) : (
                              <span className="text-white">{tool.name}</span>
                            )}
                            {tool.description && (
                              <p className="text-official-gray-400 text-sm whitespace-pre-wrap">
                                {tool.description}
                              </p>
                            )}
                          </div>
                          {Object.keys((tool.input_args || {}).properties || {})
                            .length > 0 && (
                            <Collapsible>
                              <CollapsibleTrigger className="text-official-gray-400 mt-1 flex w-full cursor-pointer items-center justify-between py-1 text-left underline hover:text-white">
                                <span className="text-xs">
                                  View Input Parameters
                                </span>
                                <ChevronDown className="ml-auto size-4" />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pt-0">
                                <div className="grid gap-2 rounded-lg p-3 py-1">
                                  {Object.keys(
                                    (tool.input_args || {}).properties || {},
                                  ).map((key) => (
                                    <div
                                      className="flex flex-col gap-0.5"
                                      key={key}
                                    >
                                      <span className="text-sm font-medium text-white">
                                        {key}
                                      </span>
                                      <span className="text-official-gray-400 text-xs">
                                        {
                                          tool.input_args?.properties?.[key]
                                            ?.description
                                        }
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">
                      {t('mcpServers.noToolsAvailableForThisServer')}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button size="md" type="button" variant="outline">
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div />
        )}

        <Tooltip>
          <TooltipTrigger>
            <Switch
              checked={server.is_enabled}
              onCheckedChange={() =>
                onToggleEnabled(server.id, server.is_enabled)
              }
            />
          </TooltipTrigger>
          <TooltipContent>
            {server.is_enabled ? 'MCP Server Enabled' : 'MCP Server Disabled'}
          </TooltipContent>
        </Tooltip>
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
          <DropdownMenuContent
            align="end"
            className="bg-official-gray-950 border-official-gray-780 border p-2.5"
          >
            <DropdownMenuItem
              className="flex items-center gap-2.5 text-xs"
              onClick={() => setIsConfigureModalOpen(true)}
            >
              <BoltIcon className="h-4 w-4" />
              Configure
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 text-xs"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle className="pb-0">{t('mcpServers.delete')}</DialogTitle>
          <DialogDescription>
            {t('mcpServers.deleteDescription', { name: server.name })}
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
                  {t('common.cancel')}
                </Button>
              </DialogClose>
              <Button
                className="min-w-[100px] flex-1"
                isLoading={isDeleting}
                onClick={handleDelete}
                size="sm"
                variant="destructive"
              >
                {t('common.delete')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
