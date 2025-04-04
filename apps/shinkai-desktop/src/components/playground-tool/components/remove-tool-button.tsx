import { DialogClose } from '@radix-ui/react-dialog';
import { useRemoveTool } from '@shinkai_network/shinkai-node-state/v2/mutations/removeTool/useRemoveTool';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@shinkai_network/shinkai-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';

export default function RemoveToolButton({
  isPlaygroundTool,
  toolKeys,
  onSuccess,
}: {
  isPlaygroundTool: boolean;
  toolKeys: string | string[];
  onSuccess?: () => void;
}) {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { mutateAsync: removeTool, isPending: isRemoveToolPending } =
    useRemoveTool({
      onSuccess: () => {
        toast.success('Tool has been removed successfully');
        setIsOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error('Failed to remove tool', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const handleRemove = async () => {
    const toolKeysArray = Array.isArray(toolKeys) ? toolKeys : [toolKeys];
    
    try {
      for (const toolKey of toolKeysArray) {
        await removeTool({
          toolKey,
          nodeAddress: auth?.node_address ?? '',
          token: auth?.api_v2_key ?? '',
          isPlaygroundTool,
        });
      }
      
      toast.success(toolKeysArray.length > 1 
        ? 'Tools have been removed successfully' 
        : 'Tool has been removed successfully');
      setIsOpen(false);
      onSuccess?.() || (toolKeysArray.length === 1 && navigate('/tools'));
    } catch (error: any) {
      toast.error('Failed to remove tool', {
        description: error.response?.data?.message ?? error.message,
      });
    }
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-lg" size="sm" variant="outline">
          Remove Tool
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">
          {Array.isArray(toolKeys) && toolKeys.length > 1 
            ? `Delete ${toolKeys.length} Tools` 
            : 'Delete Tool'}
        </DialogTitle>
        <DialogDescription>
          {Array.isArray(toolKeys) && toolKeys.length > 1 
            ? 'Are you sure you want to delete these tools? This action cannot be undone.'
            : 'Are you sure you want to delete this tool? This action cannot be undone.'}
        </DialogDescription>

        <DialogFooter>
          <div className="flex gap-2 pt-4">
            <DialogClose asChild className="flex-1">
              <Button
                className="min-w-[100px] flex-1"
                size="sm"
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="min-w-[100px] flex-1"
              isLoading={isRemoveToolPending}
              onClick={handleRemove}
              size="sm"
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
