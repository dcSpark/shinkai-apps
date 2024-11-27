import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  TooltipProvider,
} from '@shinkai_network/shinkai-ui';
import { ReactNode } from 'react';

type PlaygroundToolLayoutProps = {
  leftElement: ReactNode;
  rightElement: ReactNode;
};
export default function PlaygroundToolLayout({
  leftElement,
  rightElement,
}: PlaygroundToolLayoutProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="flex h-full flex-col px-3 py-4 pt-6">
            {leftElement}
          </ResizablePanel>
          <ResizableHandle className="bg-gray-300" />
          <ResizablePanel
            className="flex h-full flex-col px-3 py-4 pt-6"
            collapsible
            defaultSize={70}
            maxSize={70}
            minSize={40}
          >
            {rightElement}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}
