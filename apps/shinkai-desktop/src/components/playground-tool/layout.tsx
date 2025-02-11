import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@shinkai_network/shinkai-ui';
import { ChevronDown, PlayIcon, Save } from 'lucide-react';
import { ReactNode } from 'react';

import { ManageSourcesButton } from './components/manage-sources-button';

type PlaygroundToolLayoutProps = {
  leftElement: ReactNode;
  rightElement: ReactNode;
};
export default function PlaygroundToolLayout({
  leftElement,
  rightElement,
}: PlaygroundToolLayoutProps) {
  return (
    <div className="flex h-full flex-col gap-1 pt-5">
      <div className="grid grid-cols-3 items-center justify-between gap-2 px-4 pb-2">
        <Popover>
          <PopoverTrigger className="flex items-center gap-1 rounded-lg p-1 text-base font-medium hover:bg-gray-600">
            Playground Name
            <ChevronDown className="ml-1 h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-64 bg-gray-600"
            sideOffset={10}
          >
            <form action="">
              <Input name="name" placeholder="Name" type="text" />
              <Input name="description" placeholder="Description" type="text" />
              <Button size="sm" type="submit">
                Save
              </Button>
            </form>
          </PopoverContent>
        </Popover>

        <div className="flex items-center justify-center gap-2.5">
          <Button rounded="lg" size="xs">
            <PlayIcon className="h-4 w-4" />
            <span>Run</span>
          </Button>
        </div>
        <div className="flex items-center justify-end gap-2.5">
          <ManageSourcesButton
          // xShinkaiAppId={xShinkaiAppId}
          // xShinkaiToolId={xShinkaiToolId}
          />
          <Button
            className="shrink-0"
            // disabled={
            //   !toolCode ||
            //   !metadataGenerationData ||
            //   !chatInboxId ||
            //   isSavingTool
            // }
            // isLoading={isSavingTool}
            // onClick={handleSaveTool}
            rounded="lg"
            size="xs"
            variant="outline"
          >
            <Save className="h-4 w-4" />
            Save Tool
          </Button>
        </div>
      </div>
      <div className="flex h-full bg-gray-600" style={{ contain: 'strict' }}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            className="flex h-full flex-col rounded-md px-3 py-4 pt-6"
            maxSize={40}
          >
            {leftElement}
          </ResizablePanel>
          <ResizableHandle className="w-1 bg-gray-500" />
          <ResizablePanel
            className="flex h-full flex-col overflow-hidden rounded-md px-3 py-4 pt-6"
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
