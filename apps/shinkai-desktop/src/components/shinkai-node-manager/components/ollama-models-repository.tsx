import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Badge,
  Form,
  FormField,
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
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useDebounce, useMap } from '@shinkai_network/shinkai-ui/hooks';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  FILTERED_OLLAMA_MODELS_REPOSITORY,
  OllamaModelDefinition,
} from '../../..//lib/shinkai-node-manager/ollama-models';
import {
  useOllamaListQuery,
  useOllamaPullingQuery,
} from '../../../lib/shinkai-node-manager/ollama-client';
import {
  useShinkaiNodeGetDefaultModel,
  useShinkaiNodeGetOllamaApiUrlQuery,
} from '../../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { OllamaModelInstallButton } from './ollama-model-install-button';

export const OllamaModelsRepository = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation();
  const { data: defaultModel } = useShinkaiNodeGetDefaultModel();
  const { data: pullingModelsMap } = useOllamaPullingQuery();
  const { data: ollamaApiUrl } = useShinkaiNodeGetOllamaApiUrlQuery();

  const ollamaConfig = { host: ollamaApiUrl || 'http://127.0.0.1:11435' };
  const { data: installedOllamaModels } = useOllamaListQuery(ollamaConfig);
  const installedOllamaModelsMap = useMap<string, ModelResponse>();
  const selectedTagMap = useMap<string, string>();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);
  const formSchema = z.object({
    search: z.string(),
  });
  type FormSchemaType = z.infer<typeof formSchema>;
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
    },
  });
  const debouncedSearchTerm = useDebounce(form.watch('search'), 300);
  const flatData = useMemo(() => {
    return [
      ...FILTERED_OLLAMA_MODELS_REPOSITORY.sort((a, b) => {
        if (!sorting[0]?.desc) {
          return a.name > b.name ? 1 : -1;
        } else {
          return a.name < b.name ? 1 : -1;
        }
      }).filter((model) => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
          model.name.toLowerCase().includes(searchLower) ||
          model.description.toLowerCase().includes(searchLower)
        );
      }),
    ];
  }, [sorting, debouncedSearchTerm]);
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
                {isDefaultModel(
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  getFullName(model.name, selectedTagMap.get(model.name)!),
                ) && (
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
            <div className="w-[150px]">
              <OllamaModelInstallButton
                model={getFullName(
                  model.name,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  selectedTagMap.get(model.name)!,
                )}
              />
            </div>
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
    overscan: 1,
    getScrollElement: () => tableContainerRef.current,
  });
  useEffect(() => {
    installedOllamaModels?.models &&
    installedOllamaModels.models.forEach((modelResponse) => {
      installedOllamaModelsMap.set(modelResponse.name, modelResponse);
    });
    FILTERED_OLLAMA_MODELS_REPOSITORY.forEach((model) => {
      const defaultTag: string =
        model.tags?.find((tag) =>
          installedOllamaModelsMap.has(`${model.name}:${tag.name}`),
        )?.name ||
        model.tags?.find((tag) =>
          pullingModelsMap?.has(`${model.name}:${tag.name}`),
        )?.name ||
        model.tags?.find((tag) => tag.name === model.defaultTag)?.name ||
        model.tags[0].name;
      selectedTagMap.set(model.name, defaultTag);
    });
  }, [installedOllamaModels?.models, installedOllamaModelsMap, pullingModelsMap, selectedTagMap]);

  const getFullName = (model: string, tag: string): string => {
    return `${model}:${tag}`;
  };

  return (
    <div
      className={cn('w-full overflow-auto rounded', className)}
      ref={tableContainerRef}
      {...props}
    >
      <Form {...form}>
        <form
          className="flex w-[300px] grow flex-col justify-between space-y-6 overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <TextField field={field} label={t('common.search')} />
            )}
          />
        </form>
      </Form>
      <div
        className="mt-2"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
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
            {!rowVirtualizer.getVirtualItems()?.length && (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={table.getAllColumns().length}
                >
                  <span className="text-white">
                    {t('llmProviders.notFound.title')}
                  </span>
                </TableCell>
              </TableRow>
            )}
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
