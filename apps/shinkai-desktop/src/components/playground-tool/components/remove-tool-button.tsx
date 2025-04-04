import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useRemoveTool } from '@shinkai_network/shinkai-node-state/v2/mutations/removeTool/useRemoveTool';
import {
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';

export default function RemoveToolButton({
  isPlaygroundTool,
  toolKey,
}: {
  isPlaygroundTool: boolean;
  toolKey: string;
}) {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { mutateAsync: removeTool, isPending: isRemoveToolPending } =
    useRemoveTool({
      onSuccess: () => {
        toast.success('Tool has been removed successfully');
        setIsOpen(false);
        navigate('/tools');
      },
      onError: (error) => {
        toast.error('Failed to remove tool', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const handleRemove = async () => {
    await removeTool({
      toolKey: toolKey ?? '',
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      isPlaygroundTool,
    });
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  size: 'sm',
                }),
                'min-h-auto h-auto w-10 rounded-md py-2 flex justify-center'
              )}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent align="center" side="top">
            {t('common.deleteTool', 'Delete Tool')}
          </TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">Delete Tool</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this tool? This action cannot be
          undone.
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
