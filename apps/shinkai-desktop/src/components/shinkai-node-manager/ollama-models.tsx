import { useSyncOllamaModels } from '@shinkai_network/shinkai-node-state/lib/mutations/syncOllamaModels/useSyncOllamaModels';
import {
  Badge,
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
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Loader2 } from 'lucide-react';
import { ModelResponse, ProgressResponse } from 'ollama/browser';
import { useEffect, useState } from 'react';
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
  const { data: isShinkaiNodeRunning } = useShinkaiNodeIsRunningQuery();
  const { mutateAsync: shinkaiNodeSpawn } = useShinkaiNodeSpawnMutation({});
  const { mutateAsync: syncOllamaModels } = useSyncOllamaModels();
  const { isLoading: isOllamaListLoading, data: installedOllamaModels } =
    useOllamaListQuery(ollamaConfig, {});
  const { mutateAsync: ollamaPull } = useOllamaPullMutation(ollamaConfig, {
    onSuccess: (data, input) => {
      handlePullProgress(input.model, data);
    },
    onError: (_, input) => {
      pullingModelsMap.delete(input.model);
      setPullingModelsMap(new Map(pullingModelsMap));
    },
  });
  const { mutateAsync: ollamaRemove } = useOllamaRemoveMutation(ollamaConfig, {
    onSuccess: (_, input) => {
      toast.success(`Model ${input.model} removed`);
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
        setPullingModelsMap(new Map(pullingModelsMap.set(model, progress)));
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
      setPullingModelsMap(new Map(pullingModelsMap));
    }
  };
  const [installedOllamaModelsMap, setInstalledOllamaModelsMap] = useState(
    new Map<string, ModelResponse>(),
  );
  const [pullingModelsMap, setPullingModelsMap] = useState(
    new Map<string, ProgressResponse>(),
  );

  const getProgress = (progress: ProgressResponse): number => {
    return Math.ceil((100 * progress.completed) / progress.total);
  };

  useEffect(() => {
    setInstalledOllamaModelsMap(
      new Map(
        installedOllamaModels?.models.map((modelResponse) => [
          modelResponse.name,
          modelResponse,
        ]) || [],
      ),
    );
  }, [installedOllamaModels, setInstalledOllamaModelsMap]);

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
    <ScrollArea className="h-full rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-gray-700">
          <TableRow>
            <TableHead className="w-[300px]">AI Name</TableHead>
            <TableHead>Data Limit</TableHead>
            <TableHead>Quality</TableHead>
            <TableHead>Speed</TableHead>
            <TableHead>Size</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {OLLAMA_MODELS.map((model) => {
            return (
              <TableRow key={model.fullName}>
                <TableCell>
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-row space-x-2">
                      <span className="font-medium">{model.name}</span>
                    </div>
                    <span className="text-gray-80 text-ellipsis text-xs">
                      {model.description}
                    </span>
                    <Badge className={cn('text-[8px]')} variant="outline">
                      {model.fullName}
                    </Badge>
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
                  {isOllamaListLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : installedOllamaModelsMap.has(model.fullName) ? (
                    <Button
                      className="hover:border-brand py-1.5 text-sm hover:bg-transparent hover:text-white"
                      onClick={() => {
                        ollamaRemove({ model: model.fullName });
                      }}
                      variant={'destructive'}
                    >
                      Delete
                    </Button>
                  ) : pullingModelsMap.has(model.fullName) ? (
                    <div className="flex flex-col space-y-1">
                      <Progress
                        className="h-4 w-[150px] bg-gray-700 [&>*]:bg-gray-100"
                        value={getProgress(
                          pullingModelsMap.get(model.fullName)!,
                        )}
                      />
                      <span>
                        {pullingModelsMap.get(model.fullName)?.status}
                      </span>
                    </div>
                  ) : (
                    <Button
                      className="hover:border-brand py-1.5 text-sm hover:bg-transparent hover:text-white"
                      onClick={() => ollamaPull({ model: model.fullName })}
                      variant={'outline'}
                    >
                      Pull
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
