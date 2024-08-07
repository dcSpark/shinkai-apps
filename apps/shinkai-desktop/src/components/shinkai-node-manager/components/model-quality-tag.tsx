import { t } from '@shinkai_network/shinkai-i18n';
import { Badge } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Sparkles } from 'lucide-react';

import { OllamaModelQuality } from '../../../lib/shinkai-node-manager/ollama-models';

export const ModelQuailityTag = ({
  quality,
}: {
  quality: OllamaModelQuality;
}) => {
  const colorMap: { [key in OllamaModelQuality]: string } = {
    [OllamaModelQuality.Low]: 'text-orange-400 bg-orange-900',
    [OllamaModelQuality.Medium]: 'text-yellow-400 bg-yellow-900',
    [OllamaModelQuality.Good]: 'text-green-400 bg-green-900',
  };
  return (
    <Badge
      className={cn(
        'items-center justify-center rounded-full border-0 px-2 py-1 font-normal capitalize',
        colorMap[quality],
      )}
      variant="outline"
    >
      <Sparkles className="h-4 w-4" />
      <span className="ml-2">
        {quality} {t('shinkaiNode.models.labels.quality')}
      </span>
    </Badge>
  );
};
