import { AlertDialogProps } from '@radix-ui/react-alert-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
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
  const { t, Trans } = useTranslation();

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
          <AlertDialogTitle>
            {t('shinkaiNode.resetNodeWarning.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col space-y-3 text-left text-white/70">
              <div className="flex flex-col space-y-3">
                <span className="text-sm">
                  {t('shinkaiNode.resetNodeWarning.description')}
                </span>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs">
                    <span aria-label="restore" className="emoji" role="img">
                      🔑
                    </span>
                    <Trans
                      components={{
                        b: <b className="ml-1" />,
                      }}
                      i18nKey="shinkaiNode.resetNodeWarning.option1"
                    />
                  </span>
                  <span className="text-xs">
                    <span aria-label="reset" className="emoji" role="img">
                      🗑️
                    </span>
                    <Trans
                      components={{
                        b: <b className="ml-1" />,
                      }}
                      i18nKey="shinkaiNode.resetNodeWarning.option2"
                    />
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
            variant={'outline'}
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="mt-0 flex-1 text-sm"
            onClick={() => restore()}
            variant={'ghost'}
          >
            <span aria-label="restore" className="emoji" role="img">
              🔑 {t('common.restore')}
            </span>
          </Button>
          <Button className="mt-0 flex-1 text-sm" onClick={() => reset()}>
            <span aria-label="reset" className="emoji" role="img">
              🗑️ {t('common.reset')}
            </span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
