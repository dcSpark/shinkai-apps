import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buttonVariants } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ResourcesBanner } from '../components/hardware-capabilities/resources-banner';
import { OllamaModels } from '../components/shinkai-node-manager/ollama-models';
import { shinkaiNodeQueryClient } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { FixedHeaderLayout } from './layout/simple-layout';

const AIModelInstallation = () => {
  const { t } = useTranslation();

  return (
    <QueryClientProvider client={shinkaiNodeQueryClient}>
      <FixedHeaderLayout
        className="relative flex h-full w-full max-w-6xl flex-col gap-2 px-4"
        title={t('llmProviders.localAI.installTitle')}
      >
        <ResourcesBanner />
        <OllamaModels
          rightBottomElement={
            <Link
              className={cn(
                buttonVariants({
                  size: 'sm',
                }),
                'gap-2 rounded-lg px-6',
              )}
              to={{ pathname: '/' }}
            >
              {t('common.continue')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </FixedHeaderLayout>
    </QueryClientProvider>
  );
};

export default AIModelInstallation;
