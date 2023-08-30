import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shinkai_network/shinkai-ui';

import { SimpleLayout } from '../../pages/layout/simple-layout';
import AllFilesTab from './components/all-files-tab';
import MySharedFolders from './components/my-shared-folders';
import VectorFSDrawer from './components/vector-fs-drawer';
import { useVectorFsStore } from './context/vector-fs-context';

export default function VectorFs() {
  const selectedVectorFsTab = useVectorFsStore(
    (state) => state.selectedVectorFsTab,
  );
  const setSelectedVectorFsTab = useVectorFsStore(
    (state) => state.setSelectedVectorFsTab,
  );
  return (
    <SimpleLayout title="AI Files Explorer">
      <Tabs
        className="relative flex h-full flex-col"
        onValueChange={(value) =>
          setSelectedVectorFsTab(value as 'all' | 'shared-folders')
        }
        value={selectedVectorFsTab}
      >
        <TabsList className="max-w-xs ">
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
          <AllFilesTab />
        </TabsContent>
        <TabsContent className="h-full" value="shared-folders">
          <MySharedFolders />
        </TabsContent>
      </Tabs>
      <VectorFSDrawer />
    </SimpleLayout>
  );
}
