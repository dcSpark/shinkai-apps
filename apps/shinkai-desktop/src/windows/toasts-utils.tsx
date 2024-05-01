import { ExternalToast, toast } from 'sonner';

import { cn } from '../lib/utils';
import { openShinkaiNodeManagerWindow } from './utils';

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

export const errorStartingShinkaiNodeToast = () => {
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

export const successStartingShinkaiNodeToast = () => {
  return toast.success('Your local Shinkai Node is running', {
    ...defaultToastOptions,
  });
};

export const errorStoppingShinkaiNodeToast = () => {
  toast.error(
    <div>
      Error stopping your local Shinkai Node, see <ShinkaiNodeLogsLabel />
      logs for more information
    </div>,
    {
      ...defaultToastOptions,
    },
  );
};

export const successStoppingShinkaiNodeToast = () => {
  return toast.success('Your local Shinkai Node was stopped', {
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
      <ShinkaiNodeLogsLabel /> logs for more information
    </div>,
    { ...defaultToastOptions },
  );
};

export const successShinkaiNodeSetDefaultOptionsToast = () => {
  return toast.success('Options restored to default values', {
    ...defaultToastOptions,
  });
};
