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
import { ModelResponse } from 'ollama';
import { ProgressResponse } from 'ollama';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  OLLAMA_MODELS,
  OllamaModelQuality,
  OllamaModelSpeed,
} from '../../lib/shinkai-node-manager/ollama_models';
import {
  useOllamaListQuery,
  useOllamaPullMutation,
  useOllamaRemoveMutation,
} from '../../lib/shinkai-node-manager/ollama-client';
import { useShinkaiNodeGetOllamaApiUrlQuery } from '../../lib/shinkai-node-manager/shinkai-node-manager-client';

export const ModelQuailityTag = ({
  quality,
}: {
  quality: OllamaModelQuality;
}) => {
  const colorMap: { [key in OllamaModelQuality]: string } = {
    [OllamaModelQuality.Bad]: 'border-red-700 bg-red-400 text-red-600',
    [OllamaModelQuality.Medium]:
      'border-yellow-700 bg-yellow-400 text-yellow-600',
    [OllamaModelQuality.Great]: 'border-green-700 bg-green-400 text-green-600',
  };
  return (
    <Badge className={cn('capitalize', colorMap[quality])} variant="outline">
      {quality}
    </Badge>
  );
};

export const ModelSpeedTag = ({ speed }: { speed: OllamaModelSpeed }) => {
  const emojiMap: { [key in OllamaModelSpeed]: string } = {
    [OllamaModelSpeed.VerySlow]: '🐌',
    [OllamaModelSpeed.Slow]: '🐢',
    [OllamaModelSpeed.Average]: '🐕',
    [OllamaModelSpeed.Fast]: '🐎',
    [OllamaModelSpeed.VeryFast]: '🐆',
  };
  return (
    <Badge className={cn('capitalize')} variant="outline">
      {speed} {emojiMap[speed]}
    </Badge>
  );
};

export const OllamaModels = () => {
  const { data: ollamaApiUrl } = useShinkaiNodeGetOllamaApiUrlQuery();
  const ollamaConfig = { host: ollamaApiUrl || '' };
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

  return (
    <ScrollArea className="h-full rounded-md border">

    <Table>
      <TableHeader className='sticky top-0 bg-gray-700'>
        <TableRow>
          <TableHead className="w-[300px]">AI Name</TableHead>
          <TableHead>Data Limit</TableHead>
          <TableHead>Quality</TableHead>
          <TableHead>Speed</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Required RAM</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody className="">
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
              <TableCell>{model.requiredRAM} GB</TableCell>
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
                  <div className="flex flex-col items-center space-y-1">
                    <Progress
                      className="h-4 w-[150px] bg-gray-700 [&>*]:bg-gray-100"
                      value={getProgress(pullingModelsMap.get(model.fullName)!)}
                    />
                    <span>{pullingModelsMap.get(model.fullName)?.status}</span>
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
