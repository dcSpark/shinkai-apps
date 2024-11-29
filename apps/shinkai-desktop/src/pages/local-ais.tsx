import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button, buttonVariants } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { Plus, Sparkles } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { OllamaModels } from '../components/shinkai-node-manager/ollama-models';
import { shinkaiNodeQueryClient } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { SubpageLayout } from './layout/simple-layout';

const LocalAisPage = () => {
  const { t } = useTranslation();
  const [showAllOllamaModels, setShowAllOllamaModels] = React.useState(false);
  return (
    <QueryClientProvider client={shinkaiNodeQueryClient}>
      <SubpageLayout
        alignLeft
        className="relative flex h-full w-full max-w-6xl flex-col gap-2 px-4"
        title={t('llmProviders.localAI.installTitle')}
      >
        <p className="text-gray-80 pb-2 text-sm">
          {t('llmProviders.localAI.installText')}
        </p>
        <OllamaModels
          parentSetShowAllOllamaModels={setShowAllOllamaModels}
          parentShowAllOllamaModels={showAllOllamaModels}
        />
        <div className="absolute right-4 top-6 flex justify-center gap-3 pt-3">
          <Link
            className={cn(
              buttonVariants({
                size: 'auto',
                variant: 'outline',
              }),
              'min-w-[120px] gap-2 py-2.5',
            )}
            to={{ pathname: '/add-ai' }}
          >
            <Plus className="h-4 w-4" />
            {t('llmProviders.addManually')}
          </Link>
          <Button
            className={cn('gap-2')}
            onClick={() => setShowAllOllamaModels(!showAllOllamaModels)}
            size="auto"
          >
            <Sparkles className="h-4 w-4" />
            <span className="capitalize">
              {showAllOllamaModels
                ? t('shinkaiNode.models.labels.showRecommended')
                : t('shinkaiNode.models.labels.showAll')}
            </span>
          </Button>
        </div>
      </SubpageLayout>
    </QueryClientProvider>
  );
};

export default LocalAisPage;
