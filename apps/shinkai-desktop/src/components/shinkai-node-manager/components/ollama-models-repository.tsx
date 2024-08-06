import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Badge,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shinkai_network/shinkai-ui';
import { useMap } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ModelResponse } from 'ollama/browser';

import OLLAMA_MODELS_REPOSITORY from '../../../lib/shinkai-node-manager/ollama-models-repository.json';
import { useShinkaiNodeGetDefaultModel } from '../../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { OllamaModelInstallButton } from './ollama-model-install-button';

export const OllamaModelsRepository = () => {
  const { t } = useTranslation();
  const { data: defaultModel } = useShinkaiNodeGetDefaultModel();
  const installedOllamaModelsMap = useMap<string, ModelResponse>();
  const selectedTagMap = useMap<string, string>();
  const isDefaultModel = (model: string): boolean => {
    return defaultModel === model;
  };
  const getFullName = (model: string, tag: string): string => {
    return `${model}:${tag}`;
  };
  return (
    <ScrollArea className="h-full w-full flex-1 items-center rounded-md">
      <Table className="w-full border-collapse text-[13px]">
        <TableHeader className="bg-gray-400 text-xs">
          <TableRow>
            <TableHead className="md:w-[300px] lg:w-[480px]">
              {t('shinkaiNode.models.labels.models')}
            </TableHead>
            <TableHead>{t('shinkaiNode.models.labels.quality')}</TableHead>
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
                      selectedTagMap.set(model.name, value);
                    }}
                    value={selectedTagMap.get(model.name)}
                  >
                    <SelectTrigger className="p-2 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
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
                  <OllamaModelInstallButton
                    model={getFullName(
                      model.name,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      selectedTagMap.get(model.name)!,
                    )}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
