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
  return (
    <Badge className={cn(className)} variant="tags" {...props}>
      <Sparkles className="h-4 w-4" />
      <span className="ml-2">
        {quality} {t('shinkaiNode.models.labels.quality')}
      </span>
    </Badge>
  );
};
