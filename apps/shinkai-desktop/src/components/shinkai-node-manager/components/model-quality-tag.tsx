import { Badge } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';

import { OllamaModelQuality } from '../../../lib/shinkai-node-manager/ollama-models';

export const ModelQuailityTag = ({
  quality,
}: {
  quality: OllamaModelQuality;
}) => {
  const colorMap: { [key in OllamaModelQuality]: string } = {
    [OllamaModelQuality.Bad]: 'bg-red-900 text-red-400',
    [OllamaModelQuality.Medium]: 'text-yellow-400 bg-yellow-900',
    [OllamaModelQuality.Great]: 'text-green-400 bg-green-900',
  };
  return (
    <Badge
      className={cn(
        'rounded-full border-0 px-2 py-1 font-normal capitalize',
        colorMap[quality],
      )}
      variant="outline"
    >
      {quality}
    </Badge>
  );
};
