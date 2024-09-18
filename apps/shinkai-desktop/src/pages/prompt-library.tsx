import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Prompt } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useRemovePrompt } from '@shinkai_network/shinkai-node-state/v2/mutations/removePrompt/useRemovePrompt';
import { useUpdatePrompt } from '@shinkai_network/shinkai-node-state/v2/mutations/updatePrompt/useUpdatePrompt';
import { useGetPromptList } from '@shinkai_network/shinkai-node-state/v2/queries/getPromptList/useGetPromptList';
import { useGetPromptSearch } from '@shinkai_network/shinkai-node-state/v2/queries/getPromptSearch/useGetPromptSearch';
import {
  Button,
  CopyToClipboardIcon,
  Input,
  MarkdownPreview,
  ScrollArea,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Edit3, PlusIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CreatePromptDrawer } from '../components/prompt/context/prompt-selection-context';
import { useDebounce } from '../hooks/use-debounce';
import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

export const PromptLibrary = () => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;

  const {
    data: promptList,
    isPending,
    isSuccess,
  } = useGetPromptList({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const { data: searchPromptList, isLoading: isSearchPromptListPending } =
    useGetPromptSearch(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        search: debouncedSearchQuery,
      },
      { enabled: isSearchQuerySynced },
    );

  useEffect(() => {
    if (promptList && promptList.length > 0) {
      setSelectedPrompt(promptList[0]);
    }
  }, [isSuccess, promptList]);

  return (
    <SimpleLayout
      classname="max-w-auto"
      headerRightElement={
        <CreatePromptDrawer>
          <Button className="h-9 min-w-[100px] gap-2 rounded-xl" size="auto">
            <PlusIcon className="h-5 w-5" />
            New Prompt
          </Button>
        </CreatePromptDrawer>
      }
      title={t('settings.promptLibrary.label')}
    >
      <div className="grid h-[calc(100dvh-130px)] grid-cols-[300px_1fr]">
        <ScrollArea className="h-full border-r border-gray-400 pr-4 [&>div>div]:!block">
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
          <div className="flex flex-col gap-1">
            {(isPending || !isSearchQuerySynced || isSearchPromptListPending) &&
              Array.from({ length: 8 }).map((_, idx) => (
                <div
                  className={cn(
                    'text-gray-80 mb-2 flex h-10 w-full items-center gap-5 rounded-md px-2 py-2.5 text-left text-sm hover:bg-gray-300 hover:text-white',
                    'bg-gray-300 text-white',
                  )}
                  key={idx}
                />
              ))}
            {!searchQuery &&
              isSearchQuerySynced &&
              promptList?.map((prompt) => (
                <button
                  className={cn(
                    'text-gray-80 flex w-full items-center gap-5 rounded-md px-2 py-2.5 text-left text-sm hover:bg-gray-300 hover:text-white',
                    selectedPrompt?.name === prompt.name &&
                      'bg-gray-300 text-white',
                  )}
                  key={prompt.name}
                  onClick={() => {
                    setSelectedPrompt(prompt);
                  }}
                >
                  {prompt.name}
                </button>
              ))}
            {searchQuery &&
              isSearchQuerySynced &&
              searchPromptList?.map((prompt) => (
                <button
                  className={cn(
                    'text-gray-80 flex w-full items-center gap-5 rounded-md px-2 py-2.5 text-left text-sm hover:bg-gray-300',
                    selectedPrompt?.name === prompt.name &&
                      'bg-gray-300 text-white',
                  )}
                  key={prompt.name}
                  onClick={() => {
                    setSelectedPrompt(prompt);
                  }}
                >
                  {prompt.name}
                </button>
              ))}
            {searchQuery &&
              isSearchQuerySynced &&
              searchPromptList?.length === 0 && (
                <div className="flex h-20 items-center justify-center">
                  <p className="text-gray-80 text-sm">
                    {t('tools.emptyState.search.text')}
                  </p>
                </div>
              )}
          </div>
        </ScrollArea>
        <PromptPreview selectedPrompt={selectedPrompt} />
      </div>
    </SimpleLayout>
  );
};

function PromptPreview({ selectedPrompt }: { selectedPrompt: Prompt | null }) {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);

  const [editing, setEditing] = useState(false);
  const [promptEditContent, setPromptEditContent] = useState('');

  useEffect(() => {
    setEditing(false);
  }, [selectedPrompt]);

  const { mutateAsync: removePrompt } = useRemovePrompt({
    onSuccess: () => {
      toast.success('Prompt removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove prompt', {
        description: error?.response?.data?.error ?? error.message,
      });
    },
  });

  const { mutateAsync: updatePrompt, isPending } = useUpdatePrompt({
    onSuccess: () => {
      setEditing(false);
    },
    onError: (error) => {
      toast.error('Failed to update prompt', {
        description: error.message,
      });
    },
  });

  if (!selectedPrompt) {
    return <></>;
  }
  return (
    <ScrollArea className="flex h-full flex-col px-5 pb-4">
      <h2 className="mb-6 font-bold text-white">{selectedPrompt?.name}</h2>

      <div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-base text-white">Prompt</span>
            <div className="flex items-center gap-2">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
                      )}
                      onClick={() => {
                        setEditing(true);
                        setPromptEditContent(selectedPrompt?.prompt);
                      }}
                    >
                      <Edit3 />
                    </button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      <p>Edit Prompt</p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <CopyToClipboardIcon
                        className={cn(
                          'text-gray-80 h-7 w-7 border border-gray-200 bg-transparent hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
                        )}
                        string={selectedPrompt?.prompt ?? ''}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      <p>{t('common.copy')}</p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
                      )}
                      onClick={async () => {
                        await removePrompt({
                          nodeAddress: auth?.node_address ?? '',
                          token: auth?.api_v2_key ?? '',
                          promptName: selectedPrompt.name,
                        });
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      <p>Remove Prompt</p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {editing ? (
            <div>
              <Textarea
                autoFocus
                className="!min-h-[100px] resize-none pl-2 pt-2 text-sm placeholder-transparent"
                onChange={(e) => setPromptEditContent(e.target.value)}
                spellCheck={false}
                value={promptEditContent}
              />
              <div className="flex items-center justify-end gap-4 pt-3">
                <Button
                  className="h-9 min-w-[100px] rounded-md"
                  isLoading={isPending}
                  onClick={() => {
                    setEditing(false);
                  }}
                  size="auto"
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="h-9 min-w-[100px] rounded-md"
                  onClick={async () => {
                    await updatePrompt({
                      nodeAddress: auth?.node_address ?? '',
                      token: auth?.api_v2_key ?? '',
                      promptName: selectedPrompt.name,
                      promptContent: promptEditContent ?? '',
                      isPromptFavorite: selectedPrompt?.is_favorite,
                      isPromptEnabled: selectedPrompt?.is_enabled,
                      isPromptSystem: selectedPrompt?.is_system,
                      promptVersion: selectedPrompt?.version,
                    });
                  }}
                  size="auto"
                  type="button"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <MarkdownPreview
              className="prose-h1:!text-gray-80 prose-h1:!text-xs !text-gray-80"
              source={selectedPrompt?.prompt ?? ''}
            />
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
