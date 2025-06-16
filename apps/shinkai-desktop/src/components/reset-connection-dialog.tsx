import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useInitialRegistration } from '@shinkai_network/shinkai-node-state/v2/mutations/initialRegistration/useInitialRegistration';
import { useGetEncryptionKeys } from '@shinkai_network/shinkai-node-state/v2/queries/getEncryptionKeys/useGetEncryptionKeys';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@shinkai_network/shinkai-ui';
import { submitRegistrationNoCodeError } from '@shinkai_network/shinkai-ui/helpers';
import { XIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

import {
  useShinkaiNodeKillMutation,
  useShinkaiNodeRemoveStorageMutation,
  useShinkaiNodeSpawnMutation,
} from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useAuth } from '../store/auth';
import { useShinkaiNodeManager } from '../store/shinkai-node-manager';

export const ResetConnectionDialog = ({
  isOpen,
  onOpenChange,
  allowClose = false,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allowClose?: boolean;
}) => {
  const { t } = useTranslation();
  const { mutateAsync: shinkaiNodeKill, isPending: isShinkaiNodeKillPending } =
    useShinkaiNodeKillMutation();
  const {
    mutateAsync: shinkaiNodeSpawn,
    isPending: isShinkaiNodeSpawnPending,
  } = useShinkaiNodeSpawnMutation({
    onSuccess: async () => {
      if (!encryptionKeys) return;
      await submitRegistrationNoCode({
        nodeAddress: 'http://127.0.0.1:9550',
        profileEncryptionPk: encryptionKeys.profile_encryption_pk,
        profileIdentityPk: encryptionKeys.profile_identity_pk,
      });
    },
  });
  const {
    mutateAsync: shinkaiNodeRemoveStorage,
    isPending: isShinkaiNodeRemoveStoragePending,
  } = useShinkaiNodeRemoveStorageMutation();
  const { setShinkaiNodeOptions } = useShinkaiNodeManager();
  const { encryptionKeys } = useGetEncryptionKeys();
  const setAuth = useAuth((state) => state.setAuth);
  const navigate = useNavigate();

  const isResetLoading =
    isShinkaiNodeKillPending ||
    isShinkaiNodeRemoveStoragePending ||
    isShinkaiNodeSpawnPending;

  const { mutateAsync: submitRegistrationNoCode } = useInitialRegistration({
    onSuccess: (response, setupPayload) => {
      if (response.status !== 'success') {
        void shinkaiNodeKill();
      }
      if (response.status === 'success' && encryptionKeys) {
        setAuth({
          api_v2_key: response.data?.api_v2_key ?? '',
          node_address: setupPayload.nodeAddress,
          profile: 'main',
          shinkai_identity: response.data?.node_name ?? '',
          encryption_pk: response.data?.encryption_public_key ?? '',
          identity_pk: response.data?.identity_public_key ?? '',
        });

        void navigate('/ai-model-installation');
        onOpenChange(false);
      } else {
        submitRegistrationNoCodeError();
      }
    },
  });

  const handleReset = async () => {
    await shinkaiNodeKill();
    useAuth.getState().setLogout(); // clean up local storage
    await shinkaiNodeRemoveStorage({ preserveKeys: true });
    setShinkaiNodeOptions(null);
    await shinkaiNodeSpawn();
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={isOpen}>
      <AlertDialogContent className="w-[75%]">
        {allowClose && (
          <AlertDialogCancel
            className="absolute top-3 right-3 border-0"
            disabled={isResetLoading}
          >
            <XIcon className="h-4 w-4" />
          </AlertDialogCancel>
        )}
        <AlertDialogHeader>
          <AlertDialogTitle>{t('appReset.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col space-y-3 text-left text-white/70">
              <div className="text-sm">{t('appReset.description')}</div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex items-center justify-end gap-2.5">
          <Button
            className="min-w-32 text-sm"
            disabled={isResetLoading}
            isLoading={isResetLoading}
            onClick={handleReset}
            size="sm"
            variant={'destructive'}
          >
            {t('appReset.action')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
