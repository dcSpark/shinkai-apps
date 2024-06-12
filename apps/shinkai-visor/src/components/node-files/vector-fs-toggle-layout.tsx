import { ToggleGroup, ToggleGroupItem } from '@shinkai_network/shinkai-ui';
import { LayoutGrid, List } from 'lucide-react';
import React from 'react';

import { useVectorFsStore, VectorFSLayout } from './node-file-context';

export default function VectorFsToggleLayout() {
  const layout = useVectorFsStore((state) => state.layout);
  const setLayout = useVectorFsStore((state) => state.setLayout);

  return (
    <ToggleGroup type="single" value={layout}>
      <ToggleGroupItem
        aria-label="Toggle layout grid"
        onClick={() => {
          setLayout(VectorFSLayout.Grid);
        }}
        value="grid"
      >
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        aria-label="Toggle layout list"
        onClick={() => {
          setLayout(VectorFSLayout.List);
        }}
        value="list"
      >
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
