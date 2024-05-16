import { cn } from '@shinkai_network/shinkai-ui/utils';
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
  return toast.loading('Starting your local Shinkai Node', {
    ...defaultToastOptions,
  });
};
export const shinkaiNodeStartedToast = () => {
  return toast.success('Your local Shinkai Node is running', {
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
  return toast.loading('Starting your local Ollama', {
    ...defaultToastOptions,
  });
};
export const ollamaStartedToast = () => {
  return toast.success('Your local Ollama is running', {
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
  return toast.loading('Stopping your local Shinkai Node', {
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
  return toast.success('Your local Shinkai Node was stopped', {
    ...defaultToastOptions,
  });
};

export const stoppingOllamaToast = () => {
  return toast.loading('Stopping your local Ollama', {
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
  return toast.success('Your local Ollama was stopped', {
    ...defaultToastOptions,
  });
};

export const successRemovingShinkaiNodeStorageToast = () => {
  return toast.success('Your local Shinkai Node storage was removed', {
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
  return toast.success('Options restored to default values', {
    ...defaultToastOptions,
  });
};

export const successOllamaModelsSyncToast = () => {
  return toast.success(
    'Local Ollama models synchronized with your Shinkai Node',
    {
      ...defaultToastOptions,
    },
  );
};

export const errorOllamaModelsSyncToast = () => {
  return toast.error(
    'Error synchronizing your local Ollama models with your Shinkai Node',
    {
      ...defaultToastOptions,
    },
  );
};

export const pullingModelStartToast = (model: string) => {
  return toast.loading(`Starting download for AI model ${model}`, {
    ...defaultToastOptions,
  });
};
export const pullingModelProgressToast = (model: string, progress: number) => {
  return toast.loading(`Downloading AI model ${model} ${progress}%`, {
    ...defaultToastOptions,
  });
};
export const pullingModelDoneToast = (model: string) => {
  return toast.loading(`AI model ${model} downloaded`, {
    ...defaultToastOptions,
  });
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
