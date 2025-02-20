import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@shinkai_network/shinkai-ui';
import { ReactNode } from 'react';

type PlaygroundToolLayoutProps = {
  leftElement: ReactNode;
  rightElement: ReactNode;
  topElement: ReactNode;
};
export default function PlaygroundToolLayout({
  topElement,
  leftElement,
  rightElement,
}: PlaygroundToolLayoutProps) {
  return (
    <div className="bg-official-gray-950 flex h-full flex-col pt-4">
      {topElement}
      <div className="flex h-full" style={{ contain: 'strict' }}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            className="flex h-full flex-col rounded-sm pb-3"
            maxSize={40}
          >
            {leftElement}
          </ResizablePanel>
          <ResizableHandle className="bg-official-gray-1000 w-2" />
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
