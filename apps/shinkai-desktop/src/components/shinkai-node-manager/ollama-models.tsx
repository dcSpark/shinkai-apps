import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Badge, Button, Separator } from '@shinkai_network/shinkai-ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  ALargeSmall,
  BookOpenText,
  Database,
  Images,
  List,
  Star,
} from 'lucide-react';
import { useState } from 'react';

import {
  OLLAMA_MODELS,
  OllamaModelCapability,
} from '../../lib/shinkai-node-manager/ollama-models';
import {
  useShinkaiNodeGetDefaultModel,
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeSpawnMutation,
} from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
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
    <div className="flex h-full flex-col items-center space-y-8 overflow-x-hidden">
      {!showAllOllamaModels && (
        <div className="flex h-[500px] flex-nowrap items-center space-x-4">
          {OLLAMA_MODELS.map((model, index, values) => {
            return (
              <>
                {values.length - 1 === index && (
                  <div className="px/2 h-full">
                    <Separator orientation="vertical" />
                  </div>
                )}
                <Card
                  className="grid h-full w-1/4 grid-flow-row"
                  key={model.fullName}
                >
                  <CardHeader className="h-[240px]">
                    <CardTitle className='text-md'>
                      <span>{model.name}</span>
                    </CardTitle>
                    <div className="mt-2 h-[40px]">
                      {isDefaultModel(model.fullName) && (
                        <Badge
                          className={cn(
                            'rounded-md border-0 px-2 py-1 font-normal capitalize',
                            'bg-emerald-900 text-emerald-400',
                          )}
                          variant="outline"
                        >
                          {t('common.recommended')}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="h-full overflow-hidden text-ellipsis">
                      {model.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col space-y-1 text-xs">
                    <Badge
                      className={cn(
                        'mb-2 justify-center rounded-full bg-blue-700 px-2 py-1 font-normal capitalize text-blue-200',
                      )}
                      variant="outline"
                    >
                      {model.capabilities.includes(
                        OllamaModelCapability.ImageToText,
                      ) ? (
                        <>
                          <Images className="h-4 w-4" />
                          <span className="ml-2 overflow-hidden text-ellipsis">
                            {t('shinkaiNode.models.labels.visionCapability')}
                          </span>
                        </>
                      ) : (
                        <>
                          <ALargeSmall className="h-4 w-4" />
                          <span className="ml-2 overflow-hidden text-ellipsis">
                            {t('shinkaiNode.models.labels.textCapability')}
                          </span>
                        </>
                      )}
                    </Badge>
                    <div className="pb-2 pt-0">
                      <Separator />
                    </div>
                    <ModelQuailityTag quality={model.quality} />
                    <ModelSpeedTag speed={model.speed} />
                    <Badge
                      className={cn(
                        'justify-center rounded-full px-2 py-1 font-normal capitalize',
                      )}
                      variant="outline"
                    >
                      <BookOpenText className="h-4 w-4" />
                      <span className="ml-2 overflow-hidden text-ellipsis">
                        {Math.round((model.contextLength * 0.75) / 380)}{' '}
                        {t('shinkaiNode.models.labels.bookPages')}
                      </span>
                    </Badge>
                    <Badge
                      className={cn(
                        'justify-center rounded-full px-2 py-1 font-normal capitalize',
                      )}
                      variant="outline"
                    >
                      <Database className="mr-2 h-4 w-4" />
                      <span className="ml-2 overflow-hidden text-ellipsis">
                        {model.size} GB
                      </span>
                    </Badge>
                  </CardContent>
                  <CardFooter className="flex h-[75px] flex-row items-center justify-center">
                    <OllamaModelInstallButton model={model.fullName} />
                  </CardFooter>
                </Card>
              </>
            );
          })}
        </div>
      )}
      {showAllOllamaModels && <OllamaModelsRepository className="h-[500px]" />}

      <Button
        onClick={async () => setShowAllOllamaModels(!showAllOllamaModels)}
        variant={'outline'}
      >
        {!showAllOllamaModels
          ? t('shinkaiNode.models.labels.showAll')
          : t('shinkaiNode.models.labels.showRecommended')}
        {!showAllOllamaModels ? (
          <List className="ml-2" />
        ) : (
          <Star className="ml-2" />
        )}
      </Button>

      <span className="text-gray-80 text-xs">
        {t('shinkaiNode.models.poweredByOllama')}
      </span>
    </div>
  );
};
