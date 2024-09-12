import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { WorkflowPlaygroundIcon } from '@shinkai_network/shinkai-ui/assets';

import { useWorkflowSelectionStore } from '../../workflow/context/workflow-selection-context';

export default function WorkflowSelectionActionBar() {
  const setWorkflowSelectionDrawerOpen = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelectionDrawerOpen,
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="hover:bg-gray-350 flex h-7 w-7 cursor-pointer items-center justify-center gap-1.5 truncate rounded-lg px-2.5 py-1.5 text-left text-xs font-normal text-white hover:text-white [&[data-state=open]>.icon]:rotate-180"
            onClick={() => {
              setWorkflowSelectionDrawerOpen(true);
            }}
          >
            <WorkflowPlaygroundIcon className="h-4 w-4" />
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
