import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Badge } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ALargeSmall, Images } from 'lucide-react';
import { ReactNode } from 'react';

import { OllamaModelCapability } from '../../../lib/shinkai-node-manager/ollama-models';

export const ModelCapabilityTag = ({
  className,
  capability,
  ...props
}: {
  capability: OllamaModelCapability;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation();

  const capabilityMap: {
    [key in OllamaModelCapability]: { text: string; icon: ReactNode };
  } = {
    [OllamaModelCapability.ImageToText]: {
      icon: <Images className="h-3.5 w-3.5" />,
      text: t('shinkaiNode.models.labels.visionCapability'),
    },
    [OllamaModelCapability.TextGeneration]: {
      icon: <ALargeSmall className="h-3.5 w-3.5" />,
      text: t('shinkaiNode.models.labels.textCapability'),
    },
  };
  return (
    <Badge
      className={cn(
        'justify-center rounded-full border-blue-700 bg-blue-700/70 px-2 py-1 font-normal capitalize text-gray-50',
        className,
      )}
      variant="outline"
      {...props}
    >
      {capabilityMap[capability].icon}
      <span className="ml-2">{capabilityMap[capability].text}</span>
    </Badge>
  );
};
