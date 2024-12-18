import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { ShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useImportTool } from '@shinkai_network/shinkai-node-state/v2/mutations/importTool/useImportTool';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/v2/mutations/updateTool/useUpdateTool';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useGetSearchTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsSearch/useGetToolsSearch';
import {
  Badge,
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Form,
  FormField,
  Input,
  Switch,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  BoltIcon,
  CloudDownloadIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useDebounce } from '../hooks/use-debounce';
import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

export const Tools = () => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;

  const { data: toolsList, isPending } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { data: searchToolList, isLoading: isSearchToolListPending } =
    useGetSearchTools(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        search: debouncedSearchQuery,
      },
      { enabled: isSearchQuerySynced && !!searchQuery },
    );

  const { mutateAsync: updateTool } = useUpdateTool();

  return (
    <SimpleLayout
      headerRightElement={
        <div className="flex items-center gap-2">
          <ImportToolModal />
          <Link
            className={cn(
              buttonVariants({
                variant: 'default',
                size: 'auto',
              }),
              'h-[30px] gap-2 rounded-lg px-3 text-xs',
            )}
            to="/tools/create"
          >
            <PlusIcon className="size-4" />
            Create Tool
          </Link>
        </div>
      }
      title={t('tools.label')}
    >
      <div className="relative mb-4 flex h-10 w-full items-center">
        <Input
          className="placeholder-gray-80 !h-full border-none bg-gray-400 py-2 pl-10"
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search..."
          spellCheck={false}
          value={searchQuery}
        />
        <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2" />
        {searchQuery && (
          <Button
            className="absolute right-1 h-8 w-8 bg-gray-200 p-2"
            onClick={() => {
              setSearchQuery('');
            }}
            size="auto"
            type="button"
            variant="ghost"
          >
            <XIcon />
            <span className="sr-only">{t('common.clearSearch')}</span>
          </Button>
        )}
      </div>
      <div className="divide-y divide-gray-300">
        {(isPending || !isSearchQuerySynced || isSearchToolListPending) &&
          Array.from({ length: 8 }).map((_, idx) => (
            <div
              className={cn(
                'grid animate-pulse grid-cols-[1fr_115px_36px] items-center gap-5 rounded-sm bg-gray-500 px-2 py-4 text-left text-sm',
              )}
              key={idx}
            >
              <div className="flex w-full flex-1 flex-col gap-3">
                <span className="h-4 w-36 rounded-sm bg-gray-300" />
                <div className="flex flex-col gap-1">
                  <span className="h-3 w-full rounded-sm bg-gray-300" />
                  <span className="h-3 w-2/4 rounded-sm bg-gray-300" />
                </div>
              </div>
              <span className="h-7 w-full rounded-md bg-gray-300" />
              <span className="h-5 w-[36px] rounded-full bg-gray-300" />
            </div>
          ))}
        {!searchQuery &&
          isSearchQuerySynced &&
          toolsList?.map((tool) => (
            <div
              className={cn(
                'grid grid-cols-[1fr_115px_36px] items-center gap-5 rounded-sm bg-gray-500 px-2 py-4 text-left text-sm',
              )}
              key={tool.tool_router_key}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize text-white">
                    {formatText(tool.name)}{' '}
                  </span>
                  {tool.author !== '@@official.shinkai' && (
                    <Badge className="text-gray-80 bg-gray-200 text-xs font-normal">
                      {tool.author}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-80 line-clamp-2 text-xs">
                  {tool.description}
                </p>
              </div>
              <Link
                className={cn(
                  buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                  }),
                  'min-h-auto h-auto rounded-md py-2',
                )}
                to={`/tools/${tool.tool_router_key}`}
              >
                <BoltIcon className="mr-1.5 h-4 w-4" />
                {t('common.configure')}
              </Link>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Switch
                      checked={tool.enabled}
                      onCheckedChange={async () => {
                        await updateTool({
                          toolKey: tool.tool_router_key,
                          toolType: tool.tool_type,
                          toolPayload: {} as ShinkaiTool,
                          isToolEnabled: !tool.enabled,
                          nodeAddress: auth?.node_address ?? '',
                          token: auth?.api_v2_key ?? '',
                        });
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent align="center" side="top">
                      {t('common.enabled')}
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        {searchQuery &&
          isSearchQuerySynced &&
          searchToolList?.map((tool) => (
            <div
              className={cn(
                'grid grid-cols-[1fr_115px_36px] items-center gap-5 rounded-sm bg-gray-500 px-2 py-4 text-left text-sm',
              )}
              key={tool.tool_router_key}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {formatText(tool.name)}{' '}
                  </span>
                  {tool.author !== '@@official.shinkai' && (
                    <Badge className="text-gray-80 bg-gray-200 text-xs font-normal">
                      {tool.author}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-80 line-clamp-2 text-xs">
                  {tool.description}
                </p>
              </div>

              <Link
                className={cn(
                  buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                  }),
                  'min-h-auto h-auto rounded-md py-2',
                )}
                to={`/tools/${tool.tool_router_key}`}
              >
                <BoltIcon className="mr-1.5 h-4 w-4" />
                {t('common.configure')}
              </Link>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Switch
                      checked={tool.enabled}
                      onCheckedChange={async () => {
                        await updateTool({
                          toolKey: tool.tool_router_key,
                          toolType: tool.tool_type,
                          toolPayload: {} as ShinkaiTool,
                          isToolEnabled: !tool.enabled,
                          nodeAddress: auth?.node_address ?? '',
                          token: auth?.api_v2_key ?? '',
                        });
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent align="center" side="top">
                      {t('common.enabled')}
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        {searchQuery && isSearchQuerySynced && searchToolList?.length === 0 && (
          <div className="flex h-20 items-center justify-center">
            <p className="text-gray-80 text-sm">
              {t('tools.emptyState.search.text')}
            </p>
          </div>
        )}
      </div>
    </SimpleLayout>
  );
};

const importToolFormSchema = z.object({
  url: z.string().url(),
});
type ImportToolFormSchema = z.infer<typeof importToolFormSchema>;

function ImportToolModal() {
  const auth = useAuth((state) => state.auth);

  const navigate = useNavigate();
  const importToolForm = useForm<ImportToolFormSchema>({
    resolver: zodResolver(importToolFormSchema),
  });
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const { mutateAsync: importTool, isPending: isPendingImportSheet } =
    useImportTool({
      onSuccess: (data) => {
        setImportModalOpen(false);
        toast.success('Tool imported successfully', {
          action: {
            label: 'View',
            onClick: () => {
              navigate(`/tools/${data.tool_key}`);
            },
          },
        });
      },
      onError: (error) => {
        toast.error('Failed to import tool', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const onSubmit = async (data: ImportToolFormSchema) => {
    await importTool({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      url: data.url,
    });
  };

  return (
    <Dialog onOpenChange={setImportModalOpen} open={isImportModalOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-[30px] gap-2 rounded-lg px-3 text-xs"
          size="auto"
          variant="outline"
        >
          <CloudDownloadIcon className="size-4" />
          Import Tool
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[500px]">
        <DialogTitle className="pb-0">Import Tool</DialogTitle>
        <Form {...importToolForm}>
          <form
            className="mt-2 flex flex-col gap-6"
            onSubmit={importToolForm.handleSubmit(onSubmit)}
          >
            <FormField
              control={importToolForm.control}
              name="url"
              render={({ field }) => (
                <TextField
                  autoFocus
                  field={{
                    ...field,
                    placeholder: 'https://example.com/file.zip',
                  }}
                  label={'URL'}
                />
              )}
            />
            <DialogFooter>
              <Button
                className="w-full"
                disabled={isPendingImportSheet}
                isLoading={isPendingImportSheet}
                size="auto"
                type="submit"
              >
                Import
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
