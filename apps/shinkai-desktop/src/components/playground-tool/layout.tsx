import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@shinkai_network/shinkai-ui';
import { Play, Save } from 'lucide-react';
import { ReactNode } from 'react';

import { ManageSourcesButton } from './components/manage-sources-button';

type PlaygroundToolLayoutProps = {
  leftElement: ReactNode;
  rightElement: ReactNode;
  mode: 'create' | 'edit';
  toolName: string;
  xShinkaiAppId: string;
  xShinkaiToolId: string;
  isExecutionToolCodePending: boolean;
  isMetadataGenerationSuccess: boolean;
  isToolCodeGenerationPending: boolean;
  isMetadataGenerationError: boolean;
  disabledSaveTool: boolean;
  isSavingTool: boolean;
  handleSaveTool: () => void;
};
export default function PlaygroundToolLayout({
  disabledSaveTool,
  isSavingTool,
  leftElement,
  rightElement,
  mode,
  toolName,
  xShinkaiAppId,
  xShinkaiToolId,
  isExecutionToolCodePending,
  isMetadataGenerationSuccess,
  isToolCodeGenerationPending,
  isMetadataGenerationError,
  handleSaveTool,
}: PlaygroundToolLayoutProps) {
  return (
    <div className="bg-official-gray-950 flex h-full flex-col pt-4">
      <div className="grid grid-cols-3 items-center justify-between gap-2 border-b border-gray-400 px-4 pb-2.5">
        <Popover>
          <PopoverTrigger
            className="flex items-center gap-1 rounded-lg p-1 text-base font-medium"
            disabled
          >
            {mode === 'create' ? 'New Tool' : toolName}
            {/* <ChevronDown className="ml-1 h-4 w-4" /> */}
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-64 bg-gray-600"
            sideOffset={10}
          />
        </Popover>

        <div className="flex items-center justify-center gap-2.5">
          <Button
            className="text-white"
            disabled={
              !isMetadataGenerationSuccess ||
              isToolCodeGenerationPending ||
              isMetadataGenerationError
            }
            form="parameters-form"
            isLoading={isExecutionToolCodePending}
            rounded="lg"
            size="xs"
          >
            {!isExecutionToolCodePending && <Play className="h-4 w-4" />}
            Run
          </Button>
        </div>
        <div className="flex items-center justify-end gap-2.5">
          <ManageSourcesButton
            xShinkaiAppId={xShinkaiAppId}
            xShinkaiToolId={xShinkaiToolId}
          />
          <Button
            className="shrink-0"
            disabled={disabledSaveTool}
            isLoading={isSavingTool}
            onClick={handleSaveTool}
            rounded="lg"
            size="xs"
            variant="outline"
          >
            <Save className="h-4 w-4" />
            Save Tool
          </Button>
        </div>
      </div>
      <div className="flex h-full" style={{ contain: 'strict' }}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            className="flex h-full flex-col rounded-sm pb-3"
            maxSize={40}
          >
            {leftElement}
          </ResizablePanel>
          <ResizableHandle className="bg-official-gray-1000 w-1.5" />
          <ResizablePanel
            className="flex h-full flex-col overflow-hidden rounded-sm pb-3"
            collapsible
            defaultSize={70}
            maxSize={80}
            minSize={40}
          >
            {rightElement}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
