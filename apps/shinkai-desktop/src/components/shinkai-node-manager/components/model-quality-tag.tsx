import { Badge } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';

import { OllamaModelQuality } from '../../../lib/shinkai-node-manager/ollama_models';

export const ModelQuailityTag = ({
  quality,
}: {
  quality: OllamaModelQuality;
}) => {
  const colorMap: { [key in OllamaModelQuality]: string } = {
    [OllamaModelQuality.Bad]: 'border-red-700 bg-red-400 text-red-600',
    [OllamaModelQuality.Medium]:
      'border-yellow-700 bg-yellow-400 text-yellow-600',
    [OllamaModelQuality.Great]: 'border-green-700 bg-green-400 text-green-600',
  };
  return (
    <Badge className={cn('capitalize', colorMap[quality])} variant="outline">
      {quality}
    </Badge>
  );
};
