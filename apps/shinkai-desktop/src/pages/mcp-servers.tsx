import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { McpServerType } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import { useDeleteMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/deleteMcpServer/useDeleteMcpServer';
import { useGetMcpServers } from '@shinkai_network/shinkai-node-state/v2/queries/getMcpServers/useGetMcpServers';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { AlertCircle, Clock, Plus, Power, PowerOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AddMcpServerModal } from '../components/mcp-servers/add-mcp-server-modal';
import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

export const McpServers = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [isAddMcpServerModalOpen, setIsAddMcpServerModalOpen] = useState(false);
  
  const { data: mcpServers, isLoading, refetch } = useGetMcpServers({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { mutateAsync: deleteMcpServer } = useDeleteMcpServer({
    onSuccess: () => {
      toast.success('MCP server deleted successfully');
      refetch();
    },
    onError: (error: Error) => {
      toast.error('Failed to delete MCP server', {
        description: error?.message,
      });
    },
  });

  const handleDeleteMcpServer = async (id: number) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <SimpleLayout 
      headerRightElement={
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsAddMcpServerModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Server
        </Button>
      }
      title="MCP Servers"
    >
      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>MCP Servers</CardTitle>
            <CardDescription>
              List of MCP servers connected to your Shinkai Node
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </div>
            ) : mcpServers && mcpServers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mcpServers.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell>{server.type}</TableCell>
                      <TableCell>
                        {server.is_enabled ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <Power className="h-4 w-4 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Enabled
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger>
                              <PowerOff className="h-4 w-4 text-red-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Disabled
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(server.created_at)}</TableCell>
                      <TableCell>{formatDate(server.updated_at)}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleDeleteMcpServer(server.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="mb-2 h-10 w-10 text-gray-400" />
                <p className="mb-2 text-lg font-medium">
                  No MCP Servers Found
                </p>
                <p className="text-gray-500">
                  Add an MCP server to get started
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsAddMcpServerModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Server
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <p className="text-sm text-gray-500">
              {mcpServers 
                ? `${mcpServers.length} server${mcpServers.length !== 1 ? 's' : ''}` 
                : '0 servers'}
            </p>
          </CardFooter>
        </Card>
      </div>

      <AddMcpServerModal
        isOpen={isAddMcpServerModalOpen}
        onClose={() => setIsAddMcpServerModalOpen(false)}
        onSuccess={() => {
          setIsAddMcpServerModalOpen(false);
          refetch();
        }}
      />
    </SimpleLayout>
  );
};
