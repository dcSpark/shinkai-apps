import { DialogClose } from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import { useRemoveTool } from '@shinkai_network/shinkai-node-state/v2/mutations/removeTool/useRemoveTool';
import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
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
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth';

export default function RemoveNetworkAgentButton({
  toolRouterKey,
  asChild,
}: {
  toolRouterKey: string;
  asChild?: boolean;
}) {
  const auth = useAuth((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: removeTool, isPending: isRemoveToolPending } =
    useRemoveTool({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [FunctionKeyV2.GET_INSTALLED_NETWORK_TOOLS],
        });
        toast.success('Network agent removed successfully');
        setIsOpen(false);
      },
      onError: (error) => {
        toast.error('Failed to remove agent', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const handleRemove = async () => {
    await removeTool({
      toolKey: toolRouterKey,
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    });
  };

  const TriggerComponent = asChild ? Slot : 'button';

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <TriggerComponent
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'flex h-auto min-h-auto w-10 justify-center rounded-md py-2',
              )}
            >
              <Trash2 className="h-4 w-4" />
            </TriggerComponent>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent align="center" side="top">
          Remove Agent
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">Remove Agent</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove this agent? This action cannot be
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
              Remove
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
