import { useScanOllamaModels } from '@shinkai_network/shinkai-node-state/lib/queries/scanOllamaModels/useScanOllamaModels';
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';

import {
  OLLAMA_MODELS,
  OllamaModel,
  OllamaModelQuality,
  OllamaModelSpeed,
} from '../../lib/shinkai-node-manager/ollama_models';
import { useAuth } from '../../store/auth';

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
  const auth = useAuth((store) => store.auth);
  const {
    // mutateAsync: scanOllamaModels,
    // isPending: scanOllamaModelsIsPending,
  } = useScanOllamaModels({
    // onSuccess: () => {
    //   successOllamaModelsSyncToast();
    // },
    // onError: () => {
    //   errorOllamaModelsSyncToast();
    // },
  });

  const fullName = (model: OllamaModel): string => {
    return `${model.model}:${model.tag}`;
  };

  return (
    <div>
      <Table>
        <TableHeader>
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
        <TableBody>
          {OLLAMA_MODELS.map((model) => {
            return (
              <TableRow key={`${model.model}:${model.tag}`}>
                <TableCell>
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-row space-x-2">
                      <span className="font-medium">{model.name}</span>
                    </div>
                    <span className="text-gray-80 text-ellipsis text-xs">
                      {model.description}
                    </span>
                    <Badge className={cn('text-[8px]')} variant="outline">
                      {fullName(model)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{model.dataLimit} book length</TableCell>
                <TableCell>
                  <ModelQuailityTag quality={model.quality} />
                </TableCell>
                <TableCell>
                  <ModelSpeedTag speed={model.speed} />
                </TableCell>
                <TableCell>{model.size} GB</TableCell>
                <TableCell>{model.requiredRAM} GB</TableCell>
                <TableCell>
                  <Button
                    className="hover:border-brand py-1.5 text-sm hover:bg-transparent hover:text-white"
                    variant={'secondary'}
                  >
                    Pull
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
