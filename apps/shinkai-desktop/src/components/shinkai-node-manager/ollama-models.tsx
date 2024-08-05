import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useSyncOllamaModels } from '@shinkai_network/shinkai-node-state/lib/mutations/syncOllamaModels/useSyncOllamaModels';
import {
  Badge,
  Button,
  Progress,
  ScrollArea,
  ScrollBar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@shinkai_network/shinkai-ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shinkai_network/shinkai-ui';
import { useMap } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import {
  BookOpenText,
  Database,
  Download,
  Loader2,
  Minus,
  UnfoldVertical,
} from 'lucide-react';
import { ModelResponse, ProgressResponse } from 'ollama/browser';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  useOllamaListQuery,
  useOllamaPullMutation,
  useOllamaRemoveMutation,
} from '../../lib/shinkai-node-manager/ollama-client';
import { OLLAMA_MODELS } from '../../lib/shinkai-node-manager/ollama-models';
import OLLAMA_MODELS_REPOSITORY from '../../lib/shinkai-node-manager/ollama-models-repository.json';
import {
  useShinkaiNodeGetDefaultModel,
  useShinkaiNodeGetOllamaApiUrlQuery,
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeSpawnMutation,
} from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useAuth } from '../../store/auth';
import { ModelQuailityTag } from './components/model-quality-tag';
import { ModelSpeedTag } from './components/model-speed-tag';

export const OllamaModels = () => {
  const auth = useAuth((auth) => auth.auth);
  const { t } = useTranslation();
  const { data: ollamaApiUrl } = useShinkaiNodeGetOllamaApiUrlQuery();
  const { data: defaultModel } = useShinkaiNodeGetDefaultModel();
  const ollamaConfig = { host: ollamaApiUrl || 'http://127.0.0.1:11435' };

  const installedOllamaModelsMap = useMap<string, ModelResponse>();
  const selectedTagMap = useMap<string, string>();
  const pullingModelsMap = useMap<string, ProgressResponse>();

  const { data: isShinkaiNodeRunning } = useShinkaiNodeIsRunningQuery();
  const { mutateAsync: shinkaiNodeSpawn } = useShinkaiNodeSpawnMutation({});
  const { mutateAsync: syncOllamaModels } = useSyncOllamaModels(
    OLLAMA_MODELS.map((value) => value.fullName),
  );
  const [showAllOllamaModels, setShowAllOllamaModels] = useState(false);
  const { isLoading: isOllamaListLoading, data: installedOllamaModels } =
    useOllamaListQuery(ollamaConfig);
  const { mutateAsync: ollamaPull } = useOllamaPullMutation(ollamaConfig, {
    onSuccess: (data, input) => {
      handlePullProgress(input.model, data);
    },
    onError: (_, input) => {
      pullingModelsMap.delete(input.model);
    },
  });
  const { mutateAsync: ollamaRemove } = useOllamaRemoveMutation(ollamaConfig, {
    onSuccess: (_, input) => {
      toast.success(
        t('shinkaiNode.models.success.modelRemoved', {
          modelName: input.model,
        }),
      );
      installedOllamaModelsMap.delete(input.model);
    },
    onError: (error, input) => {
      toast.error(
        t('shinkaiNode.models.errors.modelRemoved', {
          modelName: input.model,
        }),
        {
          description: error.message,
        },
      );
    },
  });

  const handlePullProgress = async (
    model: string,
    progressIterator: AsyncGenerator<ProgressResponse>,
  ): Promise<void> => {
    try {
      for await (const progress of progressIterator) {
        if (!progress) {
          continue;
        }
        pullingModelsMap.set(model, progress);
        if (progress.status === 'success') {
          toast.success(
            t('shinkaiNode.models.success.modelInstalled', {
              modelName: model,
            }),
          );
          if (auth) {
            syncOllamaModels({
              nodeAddress: auth?.node_address ?? '',
              senderSubidentity: auth?.profile ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              sender: auth?.node_address ?? '',
              my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
              my_device_identity_sk: auth?.my_device_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
            });
          }
          break;
        } else if (progress.status === 'error') {
          toast.error(
            t('shinkaiNode.models.errors.modelInstalled', {
              modelName: model,
            }),
          );
        }
      }
    } catch (error) {
      toast.error(
        t('shinkaiNode.models.errors.modelInstalled', {
          modelName: model,
        }),
        {
          description: error?.toString(),
        },
      );
    } finally {
      pullingModelsMap.delete(model);
    }
  };

  const getProgress = (progress: ProgressResponse): number => {
    return Math.ceil((100 * (progress.completed ?? 0)) / (progress.total ?? 1));
  };

  const isDefaultModel = (model: string): boolean => {
    return defaultModel === model;
  };

  const getFullName = (model: string, tag: string): string => {
    return `${model}:${tag}`;
  };

  useEffect(() => {
    installedOllamaModels?.models &&
      installedOllamaModels.models.forEach((modelResponse) => {
        installedOllamaModelsMap.set(modelResponse.name, modelResponse);
      });
  }, [installedOllamaModels?.models, installedOllamaModelsMap]);

  useEffect(() => {
    OLLAMA_MODELS_REPOSITORY.forEach((model) => {
      const defaultTag: string =
        model.tags?.find((tag) =>
          installedOllamaModelsMap.has(`${model.name}:${tag.name}`),
        )?.name ||
        model.tags?.find((tag) => tag.name === model.defaultTag)?.name ||
        model.tags[0].name;
      selectedTagMap.set(model.name, defaultTag);
    });
  }, [installedOllamaModelsMap, selectedTagMap]);

  const modelList = useMemo(() => {
    return OLLAMA_MODELS.sort((model) =>
      installedOllamaModelsMap.has(model.fullName) ? -1 : 1,
    );
  }, [installedOllamaModelsMap]);

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
    <div className="flex flex-col items-center space-y-8 overflow-hidden">
      <div className="w-full flex h-[500px] flex-nowrap items-center space-x-4 rounded-md overflow-x-scroll">
        {modelList.map((model) => {
          return (
            <Card className="h-full w-[300px]" key={model.fullName}>
              <CardHeader>
                <CardTitle>
                  {model.name}
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
                </CardTitle>
                <CardDescription className='h-[100px] overflow-hidden text-ellipsis'>{model.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col space-y-1 text-xs">
                <Badge
                  className={cn(
                    'rounded-full border-0 bg-red-900 px-2 py-1 font-normal capitalize text-red-400',
                  )}
                  variant="outline"
                >
                  <BookOpenText className="mr-2 h-4 w-4" />{' '}
                  {Math.round((model.contextLength * 0.75) / 380)}{' '}
                  {t('shinkaiNode.models.table.bookPages')}
                </Badge>

                <ModelQuailityTag quality={model.quality} />
                <ModelSpeedTag speed={model.speed} />

                <Badge
                  className={cn(
                    'rounded-full border-0 bg-red-900 px-2 py-1 font-normal capitalize text-red-400',
                  )}
                  variant="outline"
                >
                  <Database className="mr-2 h-4 w-4" /> {model.size} GB
                </Badge>
              </CardContent>
              <CardFooter className="b-0 flex flex-row items-center justify-center">
                <motion.div className="flex items-center justify-center" layout>
                  {isOllamaListLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : installedOllamaModelsMap.has(model.fullName) ? (
                    <Button
                      className="hover:border-brand py-1.5 text-sm hover:text-white"
                      onClick={() => {
                        ollamaRemove({ model: model.fullName });
                      }}
                      size="auto"
                      variant={'destructive'}
                    >
                      <Minus className="mr-2 h-3 w-3" />
                      {t('common.remove')}
                    </Button>
                  ) : pullingModelsMap.get(model.fullName) ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-100">
                        {getProgress(
                          pullingModelsMap.get(
                            model.fullName,
                          ) as ProgressResponse,
                        ) + '%'}
                      </span>
                      <Progress
                        className="h-2 w-full bg-gray-200 [&>*]:bg-gray-100"
                        value={getProgress(
                          pullingModelsMap.get(
                            model.fullName,
                          ) as ProgressResponse,
                        )}
                      />
                      <span className="text-xs text-gray-100">
                        {pullingModelsMap.get(model.fullName)?.status}
                      </span>
                    </div>
                  ) : (
                    <Button
                      className="hover:border-brand py-1.5 text-sm hover:bg-transparent hover:text-white"
                      onClick={() => ollamaPull({ model: model.fullName })}
                      size="auto"
                      variant={'outline'}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t('common.install')}
                    </Button>
                  )}
                </motion.div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {!showAllOllamaModels && (
        <Button
          onClick={() => setShowAllOllamaModels(true)}
          variant={'outline'}
        >
          Show all models
          <UnfoldVertical className="ml-2" />
        </Button>
      )}

      {showAllOllamaModels && (
        <ScrollArea className="h-full w-full flex-1 items-center rounded-md">
          <Table className="w-full border-collapse text-[13px]">
            <TableHeader className="bg-gray-400 text-xs">
              <TableRow>
                <TableHead className="md:w-[300px] lg:w-[480px]">
                  {t('shinkaiNode.models.table.models')}
                </TableHead>
                <TableHead> {t('shinkaiNode.models.table.quality')}</TableHead>
                <TableHead className="w-[180px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {OLLAMA_MODELS_REPOSITORY.map((model) => {
                return (
                  <TableRow
                    className="transition-colors hover:bg-gray-300/50"
                    key={model.name}
                  >
                    <TableCell>
                      <div className="flex flex-col items-start gap-2">
                        <div className="flex flex-row items-center gap-3">
                          <span className="font-medium">{model.name}</span>
                          {isDefaultModel(model.name) && (
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

                        <span className="text-gray-80 line-clamp-3 text-ellipsis text-xs">
                          {model.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Select
                        defaultValue={
                          model.tags?.find(
                            (tag) =>
                              installedOllamaModelsMap.has(
                                `${model.name}:${tag.name}`,
                              ) || tag.name === model.defaultTag,
                          )?.name
                        }
                        name="defaultAgentId"
                        onValueChange={(value) => {
                          console.log('selecting default');
                          selectedTagMap.set(model.name, value);
                        }}
                        value={selectedTagMap.get(model.name)}
                      >
                        <SelectTrigger className="p-2 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="h-72">
                          {model.tags?.map((tag) => (
                            <SelectItem
                              className="text-xs"
                              key={tag.name}
                              value={tag.name}
                            >
                              {tag.name} - {tag.size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <motion.div
                        className="flex items-center justify-center"
                        layout
                      >
                        {isOllamaListLoading ? (
                          <Loader2 className="animate-spin" />
                        ) : installedOllamaModelsMap.has(
                            `${model.name}:${selectedTagMap.get(model.name)}`,
                          ) ? (
                          <Button
                            className="hover:border-brand py-1.5 text-sm hover:text-white"
                            onClick={() => {
                              ollamaRemove({
                                model: getFullName(
                                  model.name,
                                  selectedTagMap.get(model.name)!,
                                ),
                              });
                            }}
                            size="auto"
                            variant={'destructive'}
                          >
                            <Minus className="mr-2 h-3 w-3" />
                            {t('common.remove')}
                          </Button>
                        ) : pullingModelsMap.get(
                            getFullName(
                              model.name,
                              selectedTagMap.get(model.name)!,
                            ),
                          ) ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-100">
                              {getProgress(
                                pullingModelsMap.get(
                                  getFullName(
                                    model.name,
                                    selectedTagMap.get(model.name)!,
                                  ),
                                ) as ProgressResponse,
                              ) + '%'}
                            </span>
                            <Progress
                              className="h-2 w-full bg-gray-200 [&>*]:bg-gray-100"
                              value={getProgress(
                                pullingModelsMap.get(
                                  getFullName(
                                    model.name,
                                    selectedTagMap.get(model.name)!,
                                  ),
                                ) as ProgressResponse,
                              )}
                            />
                            <span className="text-xs text-gray-100">
                              {
                                pullingModelsMap.get(
                                  getFullName(
                                    model.name,
                                    selectedTagMap.get(model.name)!,
                                  ),
                                )?.status
                              }
                            </span>
                          </div>
                        ) : (
                          <Button
                            className="hover:border-brand py-1.5 text-sm hover:bg-transparent hover:text-white"
                            onClick={() =>
                              ollamaPull({
                                model: getFullName(
                                  model.name,
                                  selectedTagMap.get(model.name)!,
                                ),
                              })
                            }
                            size="auto"
                            variant={'outline'}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            {t('common.install')}
                          </Button>
                        )}
                      </motion.div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
      <span className="text-gray-80 text-xs">
        {t('shinkaiNode.models.poweredByOllama')}
      </span>
    </div>
  );
};
