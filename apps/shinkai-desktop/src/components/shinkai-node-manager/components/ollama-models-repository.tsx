import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Badge,
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
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ModelResponse } from 'ollama/browser';
import { useEffect, useMemo, useRef, useState } from 'react';

import OLLAMA_MODELS_REPOSITORY from '../../../lib/shinkai-node-manager/ollama-models-repository.json';
import { useShinkaiNodeGetDefaultModel } from '../../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { OllamaModelInstallButton } from './ollama-model-install-button';

export type OllamaModelDefinition = (typeof OLLAMA_MODELS_REPOSITORY)[0];

export const OllamaModelsRepository = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation();
  const { data: defaultModel } = useShinkaiNodeGetDefaultModel();
  const installedOllamaModelsMap = useMap<string, ModelResponse>();
  const selectedTagMap = useMap<string, string>();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);
  const models = OLLAMA_MODELS_REPOSITORY as OllamaModelDefinition[];
  const flatData = useMemo(() => {
    return (
      [
        ...models.sort((a, b) => {
          if (!sorting[0]?.desc) {
            return a.name > b.name ? 1 : -1;
          } else {
            return a.name < b.name ? 1 : -1;
          }
        }),
      ] ?? []
    );
  }, [models, sorting]);
  const columns = useMemo<ColumnDef<OllamaModelDefinition>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('shinkaiNode.models.labels.models'),
        enableSorting: true,
        cell: (info) => {
          const model = info.row.original;
          const isDefaultModel = (model: string): boolean => {
            return defaultModel === model;
          };
          return (
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
          );
        },
      },
      {
        accessorKey: 'tags',
        header: t('shinkaiNode.models.labels.tags'),
        enableSorting: false,
        cell: (info) => {
          const model = info.row.original;
          return (
            <Select
              defaultValue={
                model.tags?.find(
                  (tag) =>
                    installedOllamaModelsMap.has(`${model.name}:${tag.name}`) ||
                    tag.name === model.defaultTag,
                )?.name
              }
              name="defaultAgentId"
              onValueChange={(value) => {
                selectedTagMap.set(model.name, value);
              }}
              value={selectedTagMap.get(model.name)}
            >
              <SelectTrigger className="w-[220px] p-2 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="h-[200px]">
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
          );
        },
      },
      {
        accessorKey: 'actions',
        header: '',
        enableSorting: false,
        cell: (info) => {
          const model = info.row.original;
          return (
            <OllamaModelInstallButton
              model={getFullName(
                model.name,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                selectedTagMap.get(model.name)!,
              )}
            />
          );
        },
      },
    ],
    [defaultModel, installedOllamaModelsMap, selectedTagMap, t],
  );
  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater);
  };
  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }));
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: flatData.length,
    estimateSize: () => 90,
    overscan: 2,
    getScrollElement: () => tableContainerRef.current,
  });
  useEffect(() => {
    models.forEach((model) => {
      const defaultTag: string =
        model.tags?.find((tag) =>
          installedOllamaModelsMap.has(`${model.name}:${tag.name}`),
        )?.name ||
        model.tags?.find((tag) => tag.name === model.defaultTag)?.name ||
        model.tags[0].name;
      selectedTagMap.set(model.name, defaultTag);
    });
  }, [installedOllamaModelsMap, models, selectedTagMap]);

  const getFullName = (model: string, tag: string): string => {
    return `${model}:${tag}`;
  };

  return (
    <div
      className={cn('overflow-auto rounded', className)}
      ref={tableContainerRef}
      {...props}
    >
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        <Table>
          <TableHeader className="bg-gray-400 text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      <div
                        className={cn(
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                          header.id === 'actions' ? 'w-[50px]' : '',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
              const row = rows[virtualRow.index] as Row<OllamaModelDefinition>;
              return (
                <TableRow
                  className="transition-colors hover:bg-gray-300/50"
                  key={row.id}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${
                      virtualRow.start - index * virtualRow.size
                    }px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell className="p-2" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
