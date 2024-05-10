import { Toggle } from '@shinkai_network/shinkai-ui';
import { ArrowUpAZ } from 'lucide-react';

import { useVectorFsStore } from '../context/vector-fs-context';

export default function VectorFsToggleSortName() {
  const isSortByName = useVectorFsStore((state) => state.isSortByName);
  const setSortByName = useVectorFsStore((state) => state.setSortByName);

  return (
    <Toggle
      aria-label="Toggle sort name"
      onPressedChange={() => {
        setSortByName(!isSortByName);
      }}
      pressed={isSortByName}
    >
      <ArrowUpAZ className="h-4 w-4" />
    </Toggle>
  );
}
