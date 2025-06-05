import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@shinkai_network/shinkai-ui';
import { useApp } from '../../lib/composio';

interface ComposioAppDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <div>
    <p className="text-sm text-official-gray-400">{label}</p>
    <p className="text-sm">{value || 'N/A'}</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-official-gray-750 animate-pulse" />
      <div className="h-6 w-48 bg-official-gray-750 rounded animate-pulse" />
    </div>
    <div className="h-4 w-full bg-official-gray-750 rounded animate-pulse" />
    <div className="space-y-4">
      <div className="h-6 w-32 bg-official-gray-750 rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-official-gray-750 rounded animate-pulse" />
            <div className="h-4 w-32 bg-official-gray-750 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ComposioAppDetailsModal = ({
  isOpen,
  onClose,
  appId,
}: ComposioAppDetailsModalProps) => {
  const { data: app, isLoading } = useApp(appId);

  return (
    <Dialog onOpenChange={(open: boolean) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-w-2xl">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-4">
                <img 
                  src={app?.meta.logo} 
                  alt={app?.name} 
                  className="w-12 h-12 rounded-lg object-cover bg-official-gray-750"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/48?text=App';
                  }}
                />
                <span>{app?.name}</span>
              </DialogTitle>
              <DialogDescription>{app?.meta.description}</DialogDescription>
            </DialogHeader>
            
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Created" value={new Date(app?.meta.created_at || '').toLocaleDateString()} />
                  <DetailItem label="Last Updated" value={new Date(app?.meta.updated_at || '').toLocaleDateString()} />
                  <DetailItem label="Categories" value={app?.meta.categories.map(cat => cat.name).join(', ')} />
                  <DetailItem label="Tools Count" value={app?.meta.tools_count.toString()} />
                </div>
              </div>

              {app?.actions && app.actions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Available Actions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {app.actions.map((action, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{action.name}</span>
                        {action.description && (
                          <span className="text-official-gray-400"> - {action.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {app?.metadata && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Total Downloads" value={app.metadata.totalDownloads} />
                    <DetailItem label="Active Users" value={app.metadata.activeUsers} />
                    <DetailItem label="Latest Version" value={app.metadata.latestVersion} />
                    <DetailItem label="Last Updated" value={app.metadata.lastUpdated} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 