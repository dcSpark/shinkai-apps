import { t } from '@shinkai_network/shinkai-i18n';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import React from 'react';
import { ExternalToast, toast } from 'sonner';

import { openShinkaiNodeManagerWindow } from './shinkai-node-manager-windows-utils';

const ShinkaiNodeLogsLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('cursor-pointer text-white', className)}
      onClick={() => {
        openShinkaiNodeManagerWindow();
      }}
      {...props}
    >
      logs
    </span>
  );
};

export const SHINKAI_NODE_MANAGER_TOAST_ID = 'shinkai-node-manager-toast-id';
const defaultToastOptions: ExternalToast = {
  id: SHINKAI_NODE_MANAGER_TOAST_ID,
  position: 'bottom-center',
};

export const startingShinkaiNodeToast = () => {
  return toast.loading(t('shinkaiNode.notifications.startingNode'), {
    ...defaultToastOptions,
  });
};
export const shinkaiNodeStartedToast = () => {
  return toast.success(t('shinkaiNode.notifications.runningNode'), {
    ...defaultToastOptions,
  });
};
export const shinkaiNodeStartErrorToast = () => {
  toast.error(
    <div>
      Error starting your local Shinkai Node, see <ShinkaiNodeLogsLabel /> for
      more information
    </div>,
    {
      ...defaultToastOptions,
    },
  );
};

export const startingOllamaToast = () => {
  return toast.loading(t('shinkaiNode.notifications.startingOllama'), {
    ...defaultToastOptions,
  });
};
export const ollamaStartedToast = () => {
  return toast.success(t('shinkaiNode.notifications.runningOllama'), {
    ...defaultToastOptions,
  });
};
export const ollamaStartErrorToast = () => {
  toast.error(
    <div>
      Error starting your local Ollama, see <ShinkaiNodeLogsLabel /> for more
      information
    </div>,
    {
      ...defaultToastOptions,
    },
  );
};

export const stoppingShinkaiNodeToast = () => {
  return toast.loading(t('shinkaiNode.notifications.stopNode'), {
    ...defaultToastOptions,
  });
};
export const shinkaiNodeStopErrorToast = () => {
  toast.error(
    <div>
      Error stopping your local Shinkai Node, see <ShinkaiNodeLogsLabel /> for
      more information
    </div>,
    {
      ...defaultToastOptions,
    },
  );
};
export const shinkaiNodeStoppedToast = () => {
  return toast.success(t('shinkaiNode.notifications.stoppedNode'), {
    ...defaultToastOptions,
  });
};

export const stoppingOllamaToast = () => {
  return toast.loading(t('shinkaiNode.notifications.stopOllama'), {
    ...defaultToastOptions,
  });
};
export const ollamaStopErrorToast = () => {
  toast.error(
    <div>
      Error stopping your local Ollama, see <ShinkaiNodeLogsLabel /> for more
      information
    </div>,
    {
      ...defaultToastOptions,
    },
  );
};
export const ollamaStoppedToast = () => {
  return toast.success(t('shinkaiNode.notifications.stoppedOllama'), {
    ...defaultToastOptions,
  });
};

export const successRemovingShinkaiNodeStorageToast = () => {
  return toast.success(t('shinkaiNode.notifications.removedNote'), {
    ...defaultToastOptions,
  });
};

export const errorRemovingShinkaiNodeStorageToast = () => {
  return toast.error(
    <div>
      Error removing your local Shinkai Node storage, see{' '}
      <ShinkaiNodeLogsLabel /> for more information
    </div>,
    { ...defaultToastOptions },
  );
};

export const successShinkaiNodeSetDefaultOptionsToast = () => {
  return toast.success(t('shinkaiNode.notifications.optionsRestored'), {
    ...defaultToastOptions,
  });
};

export const successOllamaModelsSyncToast = () => {
  return toast.success(t('shinkaiNode.notifications.syncedOllama'), {
    ...defaultToastOptions,
  });
};

export const errorOllamaModelsSyncToast = () => {
  return toast.error(t('shinkaiNode.notifications.errorSyncOllama'), {
    ...defaultToastOptions,
  });
};

export const pullingModelStartToast = (model: string) => {
  return toast.loading(
    t('shinkaiNode.notifications.startingDownload', { modelName: model }),
    {
      ...defaultToastOptions,
    },
  );
};
export const pullingModelProgressToast = (model: string, progress: number) => {
  return toast.loading(
    t('shinkaiNode.notifications.downloadingModel', {
      modelName: model,
      progress,
    }),
    {
      ...defaultToastOptions,
    },
  );
};
export const pullingModelDoneToast = (model: string) => {
  return toast.loading(
    t('shinkaiNode.notifications.downloadedModel', {
      modelName: model,
    }),
    {
      ...defaultToastOptions,
    },
  );
};

export const pullingModelErrorToast = (model: string) => {
  return toast.error(
    <div>
      Error downloading AI model {model}, see <ShinkaiNodeLogsLabel /> for more
      information
    </div>,
    {
      ...defaultToastOptions,
    },
  );
};
