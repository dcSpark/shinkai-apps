import { useState } from 'react';
import { useApps, useInstallApp } from "../../lib/composio/react-query";
import { ComposioAppDetailsModal } from './composio-app-details-modal';
import { App } from '../../lib/composio/composio-api';
import { WrenchIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../store/auth';

export const ComposioMcpServers = () => {
  const { data: composioApps, isLoading: isLoadingComposio } = useApps();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [installingAppIds, setInstallingAppIds] = useState<Set<string>>(new Set());
  const auth = useAuth((state) => state.auth);

  const handleAppClick = async (app: App) => {
    setSelectedApp(app.id); 
  }

  const { mutate: installApp } = useInstallApp();
  
  const handleInstall = async (app: App) => {
    if (!auth) {
      toast.error("You must be logged in to install apps");
      return;
    }
    setInstallingAppIds(prev => new Set([...prev, app.id]));
    installApp({
      appId: app.id,
      auth: {
        node_address: auth.node_address,
        api_v2_key: auth.api_v2_key
      }
    }, {
      onError: (error) => {
        toast.error("Error installing app from composio");
      },
      onSettled: () => {
        setInstallingAppIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(app.id);
          return newSet;
        });
      }
    });
  }

  return (
    <div className="mx-auto flex flex-col">
      <h2 className="text-2xl font-bold">Composio Apps</h2>
      <div className="grid grid-cols-1 gap-4 mt-2">
        {isLoadingComposio ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="flex items-center justify-between p-4 bg-official-gray-800 rounded-lg border border-official-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-official-gray-750 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-official-gray-750 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-official-gray-750 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-20 h-9 bg-official-gray-750 rounded-md animate-pulse" />
            </div>
          ))
        ) : (
          composioApps?.map((app) => (
            <div 
              key={app.id} 
              className="flex items-center justify-between p-4 bg-official-gray-800 rounded-lg border border-official-gray-700 hover:border-official-gray-600 transition-colors cursor-pointer"
              onClick={() => handleAppClick(app)}
            >
              <div className="flex-1 flex items-center gap-4">
                <div className="relative">
                  <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                  </div>
                  <p className="text-sm text-official-gray-400 mb-2">{app.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-official-gray-400">
                    <span className="inline-flex items-center gap-1"><WrenchIcon className="w-4 h-4" /> {app.meta.tool_count} tools</span>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex flex-col items-end gap-2">
                <button 
                  className="px-4 py-2 bg-official-blue-600 hover:bg-official-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInstall(app);
                  }}
                  disabled={installingAppIds.has(app.id)}
                >
                  {installingAppIds.has(app.id) ? (
                    <>
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    'Install'
                  )}
                </button>
              </div>
            </div>
          ))
        )}
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
