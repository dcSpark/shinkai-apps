import { useRemoveTool } from '@shinkai_network/shinkai-node-state/v2/mutations/removeTool/useRemoveTool';
import { Button } from '@shinkai_network/shinkai-ui';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';

export default function RemoveToolButton({ toolKey }: { toolKey: string }) {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();

  const { mutateAsync: removeTool, isPending: isRemoveToolPending } =
    useRemoveTool({
      onSuccess: () => {
        toast.success('Tool has been removed successfully');
        navigate('/tools');
      },
      onError: (error) => {
        toast.error('Failed to remove tool', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  return (
    <Button
      disabled={isRemoveToolPending}
      isLoading={isRemoveToolPending}
      onClick={async () => {
        await removeTool({
          toolKey: toolKey ?? '',
          nodeAddress: auth?.node_address ?? '',
          token: auth?.api_v2_key ?? '',
        });
      }}
      size="sm"
      variant={'outline'}
    >
      Delete Tool
    </Button>
  );
}
