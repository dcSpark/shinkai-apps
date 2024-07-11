import { Toggle } from '@shinkai_network/shinkai-ui';
import { SortingAToZ, SortingZToA } from '@shinkai_network/shinkai-ui/assets';

import { useVectorFsStore } from '../context/vector-fs-context';

export default function VectorFsToggleSortName() {
  const isSortByName = useVectorFsStore((state) => state.isSortByName);
  const setSortByName = useVectorFsStore((state) => state.setSortByName);

  return (
    <Toggle
      aria-label="Toggle sort by name"
      className="bg-[#2D3239] text-white data-[state=on]:bg-[#2D3239] data-[state=on]:text-white"
      onPressedChange={() => {
        setSortByName(!isSortByName);
      }}
      pressed={isSortByName}
    >
      {isSortByName ? (
        <SortingAToZ className="h-[18px] w-[18px]" />
      ) : (
        <SortingZToA className="h-[18px] w-[18px]" />
      )}
    </Toggle>
  );
}
