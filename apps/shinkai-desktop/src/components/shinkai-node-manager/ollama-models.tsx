import { useSyncOllamaModels } from '@shinkai_network/shinkai-node-state/lib/mutations/syncOllamaModels/useSyncOllamaModels';
import {
  Button,
  Progress,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shinkai_network/shinkai-ui';
import { useMap } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import { Download, Loader2, Minus } from 'lucide-react';
import { ModelResponse, ProgressResponse } from 'ollama/browser';
import { useEffect } from 'react';
import { toast } from 'sonner';

import {
  useOllamaListQuery,
  useOllamaPullMutation,
  useOllamaRemoveMutation,
} from '../../lib/shinkai-node-manager/ollama-client';
import { OLLAMA_MODELS } from '../../lib/shinkai-node-manager/ollama-models';
import {
  useShinkaiNodeGetOllamaApiUrlQuery,
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeSpawnMutation,
} from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useAuth } from '../../store/auth';
import { ModelQuailityTag } from './components/model-quality-tag';
import { ModelSpeedTag } from './components/model-speed-tag';

export const OllamaModels = () => {
  const auth = useAuth((auth) => auth.auth);
  const { data: ollamaApiUrl } = useShinkaiNodeGetOllamaApiUrlQuery();
  const ollamaConfig = { host: ollamaApiUrl || 'http://127.0.0.1:11435' };

  const installedOllamaModelsMap = useMap<string, ModelResponse>();
  const pullingModelsMap = useMap<string, ProgressResponse>();

  const { data: isShinkaiNodeRunning } = useShinkaiNodeIsRunningQuery();
  const { mutateAsync: shinkaiNodeSpawn } = useShinkaiNodeSpawnMutation({});
  const { mutateAsync: syncOllamaModels } = useSyncOllamaModels(
    OLLAMA_MODELS.map((value) => value.fullName),
  );
  const { isLoading: isOllamaListLoading, data: installedOllamaModels } =
    useOllamaListQuery(ollamaConfig, {});
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
      toast.success(`Model ${input.model} removed`);
      installedOllamaModelsMap.delete(input.model);
    },
    onError: (error, input) => {
      toast.error(`Error removing ${input.model}. ${error.message}`);
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
          toast.success(`Model ${model} pull completed`);
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
          toast.error(`Error pulling model ${model}}`);
        }
      }
    } catch (error) {
      toast.error(`Error pulling model ${model}. ${error?.toString()}`);
    } finally {
      pullingModelsMap.delete(model);
    }
  };

  const getProgress = (progress: ProgressResponse): number => {
    return Math.ceil((100 * (progress.completed ?? 0)) / (progress.total ?? 1));
  };

  useEffect(() => {
    installedOllamaModels?.models &&
      installedOllamaModels.models.forEach((modelResponse) => {
        installedOllamaModelsMap.set(modelResponse.name, modelResponse);
      });
  }, [installedOllamaModels]);

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
    <ScrollArea className="h-full flex-1 rounded-md">
      <Table className="w-full border-collapse text-[13px]">
        <TableHeader className="bg-gray-400 text-xs">
          <TableRow>
            <TableHead className="md:w-[300px] lg:w-[480px]">AI Name</TableHead>
            <TableHead>Data Limit</TableHead>
            <TableHead>Quality</TableHead>
            <TableHead>Speed</TableHead>
            <TableHead className="w-[80px]">Size</TableHead>
            <TableHead className="w-[180px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {OLLAMA_MODELS.map((model) => {
            return (
              <TableRow
                className="transition-colors hover:bg-gray-300/50"
                key={model.fullName}
              >
                <TableCell>
                  <div className="flex flex-col items-start gap-2">
                    <span className="font-medium">{model.name}</span>
                    {/*<Badge className={cn('text-[8px]')} variant="outline">*/}
                    {/*  {model.fullName}*/}
                    {/*</Badge>*/}
                    <span className="text-gray-80 line-clamp-3 text-ellipsis text-xs">
                      {model.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {Math.round(model.contextLength / 8000)} book length
                </TableCell>
                <TableCell>
                  <ModelQuailityTag quality={model.quality} />
                </TableCell>
                <TableCell>
                  <ModelSpeedTag speed={model.speed} />
                </TableCell>
                <TableCell>{model.size} GB</TableCell>
                <TableCell>
                  <motion.div
                    className="flex items-center justify-center"
                    layout
                  >
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
                        Remove
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
                        Install
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
  );
};
