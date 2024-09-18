import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { PromptLibraryIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';

import { usePromptSelectionStore } from '../../prompt/context/prompt-selection-context';
import { actionButtonClassnames } from '../conversation-footer';

export default function PromptSelectionActionBar() {
  const setPromptSelectionDrawerOpen = usePromptSelectionStore(
    (state) => state.setPromptSelectionDrawerOpen,
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(actionButtonClassnames)}
            onClick={() => {
              setPromptSelectionDrawerOpen(true);
            }}
          >
            <PromptLibraryIcon className="h-full w-full" />
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent align="center" side="top">
            Prompt Library
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}
