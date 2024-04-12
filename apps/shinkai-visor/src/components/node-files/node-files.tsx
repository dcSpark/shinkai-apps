import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shinkai_network/shinkai-ui';
import { Folders, FolderSync, Users } from 'lucide-react';

import { Header } from '../header/header';
import AllFiles from './all-files';
import SharedFolders from './shared-folders';
import SharedWithMe from './shared-with-me';

export default function NodeFiles() {
  return (
    <div className="flex h-full flex-col gap-4">
      <Header title={'Vector File System'} />
      <Tabs className="flex w-full flex-col" defaultValue="all">
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
        <TabsContent className="py-4" value="all">
          <AllFiles />
        </TabsContent>
        <TabsContent className="py-4" value="shared-folders">
          <SharedFolders />
        </TabsContent>
      </Tabs>
    </div>
  );
}
