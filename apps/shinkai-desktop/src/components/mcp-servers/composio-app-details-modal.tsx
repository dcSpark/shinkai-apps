import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  MarkdownText,
} from '@shinkai_network/shinkai-ui';
import { useState } from 'react';
import { useApp } from '../../lib/composio';

interface ComposioAppDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) => (
  <div className="bg-official-gray-800/50 hover:bg-official-gray-800/70 rounded-lg p-3 transition-colors">
    <p className="text-official-gray-300 text-sm font-medium">{label}</p>
    <p className="mt-1 text-sm">{value || 'N/A'}</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="bg-official-gray-750 h-12 w-12 animate-pulse rounded-lg" />
      <div className="bg-official-gray-750 h-6 w-48 animate-pulse rounded" />
    </div>
    <div className="bg-official-gray-750 h-4 w-full animate-pulse rounded" />
    <div className="space-y-4">
      <div className="bg-official-gray-750 h-6 w-32 animate-pulse rounded" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="bg-official-gray-750 h-4 w-24 animate-pulse rounded" />
            <div className="bg-official-gray-750 h-4 w-32 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-official-gray-100 mb-4 text-lg font-semibold">
    {children}
  </h3>
);

export const ComposioAppDetailsModal = ({
  isOpen,
  onClose,
  appId,
}: ComposioAppDetailsModalProps) => {
  const { data: app, isLoading } = useApp(appId);
  const [imageError, setImageError] = useState(false);

  return (
    <Dialog onOpenChange={(open: boolean) => !open && onClose()} open={isOpen}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-4">
                <div className="bg-official-gray-750 relative h-12 w-12 overflow-hidden rounded-lg">
                  {!imageError ? (
                    <img
                      src={app?.meta.logo}
                      alt={`${app?.name} logo`}
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="text-official-gray-400 flex h-full w-full items-center justify-center text-xs font-medium">
                      {app?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                  )}
                </div>
                <span className="text-official-gray-100">{app?.name}</span>
              </DialogTitle>
              <DialogDescription className="text-official-gray-300 mt-2 leading-relaxed">
                {app?.meta.description}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-8 overflow-y-auto pr-2">
              <section aria-labelledby="details-title">
                <SectionTitle>Details</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    label="Created"
                    value={
                      app?.meta.created_at
                        ? new Date(app.meta.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )
                        : undefined
                    }
                  />
                  <DetailItem
                    label="Last Updated"
                    value={
                      app?.meta.updated_at
                        ? new Date(app.meta.updated_at).toLocaleDateString(
                            undefined,
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )
                        : undefined
                    }
                  />
                  <DetailItem
                    label="Categories"
                    value={app?.meta.categories
                      .map((cat) => cat.name)
                      .join(', ')}
                  />
                  <DetailItem
                    label="Tools Count"
                    value={app?.meta.tools_count.toString()}
                  />
                </div>
              </section>

              {app?.actions && app.actions.length > 0 && (
                <section aria-labelledby="actions-title">
                  <SectionTitle>Available Actions</SectionTitle>
                  <div className="space-y-2">
                    {app.actions.map((action, index) => (
                      <div
                        key={index}
                        className="bg-official-gray-800/50 hover:bg-official-gray-800/70 rounded-lg p-3 transition-colors"
                      >
                        <p className="text-official-gray-100 text-sm font-medium">
                          {action.name}
                        </p>
                        {action.description && (
                          <MarkdownText content={action.description} />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {app?.metadata && (
                <section aria-labelledby="statistics-title" className="pb-4">
                  <SectionTitle>Statistics</SectionTitle>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem
                      label="Total Downloads"
                      value={app.metadata.totalDownloads}
                    />
                    <DetailItem
                      label="Active Users"
                      value={app.metadata.activeUsers}
                    />
                    <DetailItem
                      label="Latest Version"
                      value={app.metadata.latestVersion}
                    />
                    <DetailItem
                      label="Last Updated"
                      value={app.metadata.lastUpdated}
                    />
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
