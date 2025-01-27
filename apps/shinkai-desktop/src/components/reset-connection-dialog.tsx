import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/v2/mutations/submitRegistation/useSubmitRegistrationNoCode';
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
import { useNavigate } from 'react-router-dom';

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
  const { mutateAsync: shinkaiNodeKill, isPending: isShinkaiNodeKillPending } =
    useShinkaiNodeKillMutation();
  const {
    mutateAsync: shinkaiNodeSpawn,
    isPending: isShinkaiNodeSpawnPending,
  } = useShinkaiNodeSpawnMutation({
    onSuccess: async () => {
      if (!encryptionKeys) return;
      await submitRegistrationNoCode({
        profile: 'main',
        registration_name: 'main_device',
        node_address: 'http://127.0.0.1:9550',
        ...encryptionKeys,
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

  const { mutateAsync: submitRegistrationNoCode } = useSubmitRegistrationNoCode(
    {
      onSuccess: (response, setupPayload) => {
        if (response.status !== 'success') {
          shinkaiNodeKill();
        }
        if (response.status === 'success' && encryptionKeys) {
          const updatedSetupData = {
            ...encryptionKeys,
            ...setupPayload,
            permission_type: '',
            shinkai_identity: response.data?.node_name ?? '',
            node_signature_pk: response.data?.identity_public_key ?? '',
            node_encryption_pk: response.data?.encryption_public_key ?? '',
            api_v2_key: response.data?.api_v2_key ?? '',
          };
          setAuth(updatedSetupData);
          navigate('/ai-model-installation');
          onOpenChange(false);
        } else {
          submitRegistrationNoCodeError();
        }
      },
    },
  );

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
            className="absolute right-3 top-3 border-0"
            disabled={isResetLoading}
          >
            <XIcon className="h-4 w-4" />
          </AlertDialogCancel>
        )}
        <AlertDialogHeader>
          <AlertDialogTitle>App Reset Required</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col space-y-3 text-left text-white/70">
              <div className="text-sm">
                We&apos;re currently in beta and we made some significant
                updates to improve your experience. To apply these updates, we
                need to reset your data.
                <br /> <br />
                If you need assistance, please contact our support team.
              </div>
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
            Reset App
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
