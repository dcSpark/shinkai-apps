import { AlertDialogProps } from '@radix-ui/react-alert-dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@shinkai_network/shinkai-ui';
import { useNavigate } from 'react-router-dom';

import {
  useShinkaiNodeKillMutation,
  useShinkaiNodeRemoveStorageMutation,
  useShinkaiNodeSpawnMutation,
} from '../lib/shinkai-node-manager/shinkai-node-manager-client';

export const ResetStorageBeforeConnectConfirmationPrompt = ({
  onCancel,
  onRestore,
  onReset,
  ...props
}: {
  onCancel?: () => void;
  onRestore?: () => void;
  onReset?: () => void;
} & AlertDialogProps) => {
  const navigate = useNavigate();
  const { mutateAsync: shinkaiNodeKill } = useShinkaiNodeKillMutation();
  const { mutateAsync: shinkaiNodeSpawn } = useShinkaiNodeSpawnMutation();
  const { mutateAsync: shinkaiNodeRemoveStorage } =
    useShinkaiNodeRemoveStorageMutation();

  const cancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  const restore = async () => {
    navigate('/restore');
    if (typeof onRestore === 'function') {
      onRestore();
    }
  };

  const reset = async () => {
    await shinkaiNodeKill();
    await shinkaiNodeRemoveStorage();
    await shinkaiNodeSpawn();
    if (typeof onReset === 'function') {
      onReset();
    }
  };

  return (
    <AlertDialog {...props}>
      <AlertDialogContent className="w-[75%]">
        <AlertDialogHeader>
          <AlertDialogTitle>Unable to connect</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col space-y-3 text-left text-white/70">
              <div className="flex flex-col space-y-3">
                <span className="text-sm">
                  Your Shinkai Node is currently locked by existing keys. To
                  connect again you have two options:
                </span>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs">
                    <span aria-label="restore" className="emoji" role="img">
                      🔑
                    </span>
                    <b className="ml-1">Restore:</b> Try to restore your
                    connection using a backed up keys.
                  </span>
                  <span className="text-xs">
                    <span aria-label="reset" className="emoji" role="img">
                      🗑️
                    </span>
                    <b className="ml-1">Reset:</b> Delete your Shinkai Node
                    Storage (this will permanently delete all your data).
                  </span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex gap-2">
          <Button
            className="mt-0 flex-1 text-sm"
            onClick={() => cancel()}
            variant={'ghost'}
          >
            Cancel
          </Button>
          <Button
            className="mt-0 flex-1 text-sm"
            onClick={() => restore()}
            variant={'ghost'}
          >
            <span aria-label="restore" className="emoji" role="img">
              🔑 Restore
            </span>
          </Button>
          <Button className="mt-0 flex-1 text-sm" onClick={() => reset()}>
            <span aria-label="reset" className="emoji" role="img">
              🗑️ Reset
            </span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
