import { t } from '@shinkai_network/shinkai-i18n';
import { Badge } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Sparkles } from 'lucide-react';

import { OllamaModelQuality } from '../../../lib/shinkai-node-manager/ollama-models';

export const ModelQuailityTag = ({
  className,
  quality,
  ...props
}: {
  quality: OllamaModelQuality;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const colorMap: { [key in OllamaModelQuality]: string } = {
    [OllamaModelQuality.Low]: 'text-orange-200 bg-orange-900',
    [OllamaModelQuality.Medium]: 'text-yellow-200 bg-yellow-900',
    [OllamaModelQuality.Good]: 'text-green-200 bg-green-900',
  };
  return (
    <Badge
      className={cn(
        'items-center justify-center rounded-full border-0 px-2 py-1 font-normal capitalize',
        colorMap[quality],
        className,
      )}
      variant="outline"
      {...props}
    >
      <Sparkles className="h-4 w-4" />
      <span className="ml-2">
        {quality} {t('shinkaiNode.models.labels.quality')}
      </span>
    </Badge>
  );
};
