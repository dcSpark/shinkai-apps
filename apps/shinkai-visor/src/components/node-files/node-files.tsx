import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shinkai_network/shinkai-ui';
import React from 'react';

import AllFiles from './all-files';
import MySharedFolders from './my-shared-folders';
import { useVectorFsStore } from './node-file-context';
import VectorFSDrawer from './vector-fs-drawer';

export default function NodeFiles() {
  const selectedVectorFsTab = useVectorFsStore(
    (state) => state.selectedVectorFsTab,
  );
  const setSelectedVectorFsTab = useVectorFsStore(
    (state) => state.setSelectedVectorFsTab,
  );
  return (
    <div className="flex h-full flex-col gap-4">
      <Tabs
        className="flex h-full w-full flex-col"
        onValueChange={(value) =>
          setSelectedVectorFsTab(value as 'all' | 'shared-folders')
        }
        value={selectedVectorFsTab}
      >
        <TabsList>
          <TabsTrigger className="flex flex-1 items-center gap-2" value="all">
            All Files
          </TabsTrigger>
          <TabsTrigger
            className="flex flex-1 items-center gap-2"
            value="shared-folders"
          >
            Shared Folders
          </TabsTrigger>
        </TabsList>
        <TabsContent className="h-full" value="all">
          <AllFiles />
        </TabsContent>
        <TabsContent className="h-full" value="shared-folders">
          <MySharedFolders />
        </TabsContent>
      </Tabs>
      <VectorFSDrawer />
    </div>
  );
}
