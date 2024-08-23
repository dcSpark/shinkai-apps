import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Badge,
  Button,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shinkai_network/shinkai-ui';
import {
  GoogleIcon,
  MetaIcon,
  MicrosoftIcon,
  MistralIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BookOpenText, Database, Star, StarIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import { OLLAMA_MODELS } from '../../lib/shinkai-node-manager/ollama-models';
import {
  useShinkaiNodeGetDefaultModel,
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeSpawnMutation,
} from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { ModelCapabilityTag } from './components/model-capability-tag';
import { ModelQuailityTag } from './components/model-quality-tag';
import { ModelSpeedTag } from './components/model-speed-tag';
import { OllamaModelInstallButton } from './components/ollama-model-install-button';
import { OllamaModelsRepository } from './components/ollama-models-repository';

export const OllamaModels = () => {
  const { t } = useTranslation();
  const { data: defaultModel } = useShinkaiNodeGetDefaultModel();

  const { data: isShinkaiNodeRunning } = useShinkaiNodeIsRunningQuery();
  const { mutateAsync: shinkaiNodeSpawn } = useShinkaiNodeSpawnMutation({});

  const [showAllOllamaModels, setShowAllOllamaModels] = useState(false);

  const isDefaultModel = (model: string): boolean => {
    return defaultModel === model;
  };

  const providerLogoMap = useMemo(() => {
    return {
      Microsoft: <MicrosoftIcon className="h-6 w-6" />,
      Google: <GoogleIcon className="h-6 w-6" />,
      Meta: <MetaIcon className="h-6 w-6" />,
      Mistral: <MistralIcon className="h-6 w-6" />,
    };
  }, []);

  if (!isShinkaiNodeRunning) {
    return (
      <div className="flex h-full w-full flex-row items-center justify-center">
        <div className="text-gray-100">
          <span
            className={cn('cursor-pointer text-white underline')}
            onClick={() => {
              if (isShinkaiNodeRunning) {
                return;
              }
              shinkaiNodeSpawn();
            }}
          >
            Start
          </span>{' '}
          Shinkai Node to manage your AI models
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-2',
        showAllOllamaModels && 'h-full',
      )}
    >
      {!showAllOllamaModels && (
        <ScrollArea className="mt-1 flex flex-1 flex-col overflow-auto [&>div>div]:!block">
          <div className="grid grid-cols-2 gap-4">
            {OLLAMA_MODELS.map((model) => {
              return (
                <Card className="gap- flex flex-col" key={model.fullName}>
                  <CardHeader className="relative">
                    <CardTitle className="text-md mb-3 flex items-center gap-2">
                      <span className="bg-gray-350 rounded-lg p-2">
                        {model.provider
                          ? providerLogoMap[
                              model?.provider as keyof typeof providerLogoMap
                            ]
                          : null}
                      </span>

                      <span>{model.name}</span>
                      {isDefaultModel(model.fullName) && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                className={cn(
                                  'border-brand ml-2 flex inline-flex h-5 w-5 items-center justify-center rounded-full border p-0 font-medium',
                                )}
                                variant="gradient"
                              >
                                <StarIcon className="text-brand size-3" />
                              </Badge>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent align="center" side="top">
                                {t('common.recommended')}
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CardTitle>
                    <CardDescription className="overflow-hidden text-ellipsis">
                      {model.description}
                    </CardDescription>
                    <div className="absolute right-3 top-3 flex items-center justify-center">
                      <OllamaModelInstallButton model={model.fullName} />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-1 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {model.capabilities.map((capability) => (
                        <ModelCapabilityTag
                          capability={capability}
                          key={capability}
                        />
                      ))}
                      <ModelQuailityTag quality={model.quality} />
                      <ModelSpeedTag speed={model.speed} />
                      <Badge variant="tags">
                        <BookOpenText className="h-3.5 w-3.5" />
                        <span className="ml-2 overflow-hidden text-ellipsis">
                          {t('shinkaiNode.models.labels.bookPages', {
                            pages: Math.round(
                              (model.contextLength * 0.75) / 380,
                            ),
                          })}
                        </span>
                      </Badge>
                      <Badge variant="tags">
                        <Database className="mr-2 h-4 w-4" />
                        <span className="text-ellipsis">{model.size} GB</span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {showAllOllamaModels && (
        <div className="h-full w-full">
          <AutoSizer>
            {({ height, width }) => (
              <OllamaModelsRepository style={{ height, width }} />
            )}
          </AutoSizer>
        </div>
      )}
      <span className="text-gray-80 w-full text-right text-xs">
        {t('shinkaiNode.models.poweredByOllama')}
      </span>

      <Button
        className="gap-2 underline"
        onClick={async () => setShowAllOllamaModels(!showAllOllamaModels)}
        variant={'link'}
      >
        {!showAllOllamaModels ? null : <Star className="ml-2 h-4 w-4" />}
        {!showAllOllamaModels
          ? t('shinkaiNode.models.labels.showAll')
          : t('shinkaiNode.models.labels.showRecommended')}
      </Button>
    </div>
  );
};
