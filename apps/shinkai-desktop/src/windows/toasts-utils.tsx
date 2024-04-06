import { toast } from 'sonner';

import { cn } from '../lib/utils';
import { openShinkaiNodeManagerWindow } from './utils';

const ShinkaiNodeLogsLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('text-white cursor-pointer', className)}
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

export const startingShinkaiNodeToast = () => {
  return toast.loading('Starting your local Shinkai Node automatically', {
    id: SHINKAI_NODE_MANAGER_TOAST_ID,
  });
};

export const errorStartingShinkaiNodeToast = () => {
  toast.error(
    <div>
      Error starting your local Shinkai Node, see <ShinkaiNodeLogsLabel /> for
      more information
    </div>,
    {
      id: SHINKAI_NODE_MANAGER_TOAST_ID,
    },
  );
};

export const successStartingShinkaiNodeToast = () => {
  return toast.success('Your local Shinkai Node is running', {
    id: SHINKAI_NODE_MANAGER_TOAST_ID,
  });
};

export const errorStoppingShinkaiNodeToast = () => {
  toast.error(
    <div>
      Error stopping your local Shinkai Node, see <ShinkaiNodeLogsLabel />
      logs for more information
    </div>,
    {
      id: SHINKAI_NODE_MANAGER_TOAST_ID,
    },
  );
};

export const successStoppingShinkaiNodeToast = () => {
  return toast.success('Your local Shinkai Node was stopped', {
    id: SHINKAI_NODE_MANAGER_TOAST_ID,
  });
};

export const successRemovingShinkaiNodeStorageToast = () => {
  return toast.success('Your local Shinkai Node storage was removed', {
    id: SHINKAI_NODE_MANAGER_TOAST_ID,
  });
};

export const errorRemovingShinkaiNodeStorageToast = () => {
  return toast.error(
    <div>
      Error removing your local Shinkai Node storage, see{' '}
      <ShinkaiNodeLogsLabel /> logs for more information
    </div>,
    { id: SHINKAI_NODE_MANAGER_TOAST_ID },
  );
};
