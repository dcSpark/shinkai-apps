import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { WorkflowPlaygroundIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';

import { useWorkflowSelectionStore } from '../../workflow/context/workflow-selection-context';
import { actionButtonClassnames } from '../conversation-footer';

export default function WorkflowSelectionActionBar() {
  const setWorkflowSelectionDrawerOpen = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelectionDrawerOpen,
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(actionButtonClassnames)}
            onClick={() => {
              setWorkflowSelectionDrawerOpen(true);
            }}
          >
            <WorkflowPlaygroundIcon className="h-full w-full" />
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent align="center" side="top">
            Add Workflow
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}
