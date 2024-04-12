import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shinkai_network/shinkai-ui';
import React from 'react';

import { Header } from '../header/header';
import AllFiles from './all-files';
import SharedFolders from './shared-folders';
import VectorFSDrawer from './vector-fs-drawer';

export default function NodeFiles() {
  return (
    <div className="flex h-full flex-col gap-4">
      <Header title={'Vector File System'} />
      <Tabs className="flex h-full w-full flex-col" defaultValue="all">
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
          <SharedFolders />
        </TabsContent>
      </Tabs>
      <VectorFSDrawer />
    </div>
  );
}
