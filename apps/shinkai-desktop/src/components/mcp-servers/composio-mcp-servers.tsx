import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  type McpServer,
  McpServerType,
} from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import { useDeleteMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/deleteMcpServer/useDeleteMcpServer';
import { Button } from '@shinkai_network/shinkai-ui';
import { Loader2Icon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type App } from '../../lib/composio/composio-api';
import { useApps, useInstallApp } from '../../lib/composio/react-query';
import { useAuth } from '../../store/auth';
import { ComposioAppDetailsModal } from './composio-app-details-modal';

export const ComposioMcpServers = ({
  installedMcpServers,
  search,
}: {
  installedMcpServers: McpServer[];
  search?: string;
}) => {
  const { t } = useTranslation();
  const { data: composioApps, isLoading: isLoadingComposio } = useApps();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [installingAppIds, setInstallingAppIds] = useState<Set<string>>(
    new Set(),
  );
  const auth = useAuth((state) => state.auth);

  const handleAppClick = async (app: App) => {
    setSelectedApp(app.id);
  };

  const { mutate: installApp } = useInstallApp({
    onSuccess: (data) => {
      toast.success(
        t('mcpServers.composio.installSuccess', {
          appName: data.name,
        }),
      );
    },
    onError: () => {
      toast.error(t('mcpServers.composio.installFailed'));
    },
  });
  const { mutate: deleteMcpServer, isPending: isLoadingDeleteMcpServer } =
    useDeleteMcpServer({
      onSuccess: (data) => {
        toast.success(
          t('mcpServers.composio.uninstallSuccess', {
            appName: data.name,
          }),
        );
      },
      onError: () => {
        toast.error(t('mcpServers.composio.uninstallFailed'));
      },
    });

  const filteredApps = useMemo(() => {
    if (!search) {
      return composioApps;
    }
    return composioApps?.filter(
      (app) =>
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description.toLowerCase().includes(search.toLowerCase()),
    );
  }, [composioApps, search]);

  const handleInstall = async (app: App) => {
    if (!auth) {
      toast.error(t('mcpServers.composio.loginRequired'));
      return;
    }
    setInstallingAppIds((prev) => new Set([...prev, app.id]));
    installApp(
      {
        appId: app.id,
        auth: {
          node_address: auth.node_address,
          api_v2_key: auth.api_v2_key,
        },
      },
      {
        onError: (error) => {
          toast.error(t('mcpServers.composio.installFailed'));
        },
        onSettled: () => {
          setInstallingAppIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(app.id);
            return newSet;
          });
        },
      },
    );
  };

  const handleUninstall = async (app: App) => {
    if (!auth) {
      return;
    }
    const mcpServerId = installMcpServersIndexedByComposioAppId.get(app.id)?.id;
    if (!mcpServerId) {
      return;
    }
    deleteMcpServer({
      id: mcpServerId,
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
    });
  };

  const getComposioAppIdFromSseUrl = (url: string) => {
    let composioAppIdFromSseUrlRegexp =
      /https:\/\/mcp\.composio\.dev\/partner\/composio\/([a-z0-9]+)\?customerId/;
    let composioAppIdFromHttpUrlRegexp =
      /https:\/\/mcp\.composio\.dev\/partner\/composio\/([a-z0-9]+)\/mcp\?customerId/;
    let composioAppIdFromSseUrl = composioAppIdFromSseUrlRegexp.exec(url);
    let composioAppIdFromHttpUrl = composioAppIdFromHttpUrlRegexp.exec(url);
    if (composioAppIdFromSseUrl) {
      return composioAppIdFromSseUrl[1];
    } else if (composioAppIdFromHttpUrl) {
      return composioAppIdFromHttpUrl[1];
    }
    return null;
  };

  const installMcpServersIndexedByComposioAppId = useMemo(() => {
    const indexed = new Map<string, McpServer>();
    for (const server of installedMcpServers) {
      if (
        server.type === McpServerType.Sse ||
        server.type === McpServerType.Http
      ) {
        const key = getComposioAppIdFromSseUrl(server.url);
        console.log('key', server.url, key);
        if (key) {
          indexed.set(key, server);
        }
      }
    }
    return indexed;
  }, [installedMcpServers]);

  return (
    <div className="mx-auto flex flex-col">
      <h2 className="text-2xl font-bold">{t('mcpServers.composio.title')}</h2>
      <div className="divide-official-gray-780 grid grid-cols-1 gap-2 divide-y overflow-y-auto py-4 pr-2">
        {isLoadingComposio
          ? [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-official-gray-800 border-official-gray-700 flex h-24 items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-official-gray-750 h-12 w-12 shrink-0 animate-pulse rounded-lg" />
                  <div className="space-y-2">
                    <div className="bg-official-gray-750 h-5 w-32 animate-pulse rounded" />
                    <div className="bg-official-gray-750 h-4 w-48 animate-pulse rounded" />
                  </div>
                </div>
                <div className="bg-official-gray-750 h-9 w-20 animate-pulse rounded-md" />
              </div>
            ))
          : filteredApps?.map((app) => (
              <div
                key={app.id}
                className="bg-official-gray-800 border-official-gray-700 hover:border-official-gray-600 flex h-20 cursor-pointer items-center justify-between rounded-lg border p-2 transition-colors"
                onClick={() => handleAppClick(app)}
              >
                <div className="flex flex-1 items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-lg font-semibold text-white">
                        {app.name}
                      </h3>
                    </div>
                    <p className="text-official-gray-400 line-clamp-2 text-sm">
                      {app.description}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  {!installMcpServersIndexedByComposioAppId.has(app.id) && (
                    <Button
                      className="flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleInstall(app);
                      }}
                      disabled={installingAppIds.has(app.id)}
                      size="sm"
                      variant="outline"
                    >
                      {installingAppIds.has(app.id) ? (
                        <>
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                          {t('mcpServers.composio.installing')}
                        </>
                      ) : (
                        t('mcpServers.composio.install')
                      )}
                    </Button>
                  )}

                  {installMcpServersIndexedByComposioAppId.has(app.id) && (
                    <Button
                      className="flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleUninstall(app);
                      }}
                      disabled={isLoadingDeleteMcpServer}
                      size="sm"
                      variant="outline"
                    >
                      {isLoadingDeleteMcpServer ? (
                        <>
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                          {t('mcpServers.composio.uninstalling')}
                        </>
                      ) : (
                        t('mcpServers.composio.uninstall')
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
      </div>

      {selectedApp && (
        <ComposioAppDetailsModal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          appId={selectedApp}
        />
      )}
    </div>
  );
};
