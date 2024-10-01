import { PlusIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { useGetJobScope } from '@shinkai_network/shinkai-node-state/v2/queries/getJobScope/useGetJobScope';
import {
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { FilesIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { useSetJobScope } from './context/set-job-scope-context';

const ConversationHeaderEmpty = () => {
  const { t } = useTranslation();
  const isChatSidebarCollapsed = useSettings(
    (state) => state.isChatSidebarCollapsed,
  );
  const setChatSidebarCollapsed = useSettings(
    (state) => state.setChatSidebarCollapsed,
  );
  const setSetJobScopeOpen = useSetJobScope(
    (state) => state.setSetJobScopeOpen,
  );
  const selectedKeys = useSetJobScope((state) => state.selectedKeys);

  return (
    <div className="flex h-[58px] items-center justify-between border-b border-gray-400 px-4 py-2">
      <div className="inline-flex items-center gap-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="text-gray-80 flex items-center gap-2"
                onClick={() => setChatSidebarCollapsed(!isChatSidebarCollapsed)}
                size="icon"
                variant="tertiary"
              >
                {isChatSidebarCollapsed ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isChatSidebarCollapsed ? 'Open' : 'Close'} Chat Sidebar
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="flex flex-col items-center gap-1">
                <p> Toggle Chat Sidebar</p>
                <div className="text-gray-80 flex items-center justify-center gap-2 text-center">
                  <span>⌘</span>
                  <span>B</span>
                </div>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>

        <span className="mr-2.5 line-clamp-1 inline text-sm font-medium capitalize text-white">
          New Chat
        </span>
      </div>

      <Button
        className={cn(
          'flex h-auto w-auto items-center gap-2 rounded-lg bg-gray-400 px-2.5 py-1.5',
        )}
        onClick={() => {
          setSetJobScopeOpen(true);
        }}
        size="auto"
        type="button"
        variant="ghost"
      >
        <div className="flex items-center gap-2">
          <FilesIcon className="h-4 w-4" />
          <p className="text-xs text-white"> {t('vectorFs.localFiles')}</p>
        </div>
        {Object.keys(selectedKeys || {}).length > 0 ? (
          <Badge className="bg-brand inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 p-0 text-center text-gray-50">
            {Object.keys(selectedKeys || {}).length}
          </Badge>
        ) : (
          <Badge className="inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 bg-gray-200 p-0 text-center text-gray-50">
            <PlusIcon className="h-3.5 w-3.5" />
          </Badge>
        )}
      </Button>
    </div>
  );
};

const ConversationHeaderWithInboxId = () => {
  const currentInbox = useGetCurrentInbox();
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const auth = useAuth((state) => state.auth);

  const isChatSidebarCollapsed = useSettings(
    (state) => state.isChatSidebarCollapsed,
  );
  const setChatSidebarCollapsed = useSettings(
    (state) => state.setChatSidebarCollapsed,
  );
  const { t } = useTranslation();

  const setSetJobScopeOpen = useSetJobScope(
    (state) => state.setSetJobScopeOpen,
  );

  const selectedKeys = useSetJobScope((state) => state.selectedKeys);
  const onSelectedKeysChange = useSetJobScope(
    (state) => state.onSelectedKeysChange,
  );

  const selectedFileKeysRef = useSetJobScope(
    (state) => state.selectedFileKeysRef,
  );
  const selectedFolderKeysRef = useSetJobScope(
    (state) => state.selectedFolderKeysRef,
  );
  const { data: jobScope, isSuccess } = useGetJobScope(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
    },
    { enabled: !!inboxId },
  );

  const hasFolders = isSuccess && jobScope.vector_fs_folders.length > 0;
  const hasFiles = isSuccess && jobScope.vector_fs_items.length > 0;

  const filesAndFoldersCount = isSuccess
    ? jobScope.vector_fs_folders.length + jobScope.vector_fs_items.length
    : 0;
  const hasConversationContext = hasFolders || hasFiles;

  useEffect(() => {
    if (
      isSuccess &&
      inboxId &&
      (jobScope.vector_fs_folders?.length > 0 ||
        jobScope.vector_fs_items?.length > 0)
    ) {
      const selectedVRFilesPathMap = jobScope.vector_fs_items.reduce(
        (acc, file) => {
          selectedFileKeysRef.set(file.path, file);
          acc[file.path] = {
            checked: true,
          };
          return acc;
        },
        {} as Record<string, { checked: boolean }>,
      );

      const selectedVRFoldersPathMap = jobScope.vector_fs_folders.reduce(
        (acc, folder) => {
          selectedFolderKeysRef.set(folder.path, folder);
          acc[folder.path] = {
            checked: true,
          };
          return acc;
        },
        {} as Record<string, { checked: boolean }>,
      );

      onSelectedKeysChange({
        ...selectedVRFilesPathMap,
        ...selectedVRFoldersPathMap,
      });
    }
  }, [
    jobScope?.vector_fs_folders,
    jobScope?.vector_fs_items,
    isSuccess,
    inboxId,
  ]);

  return (
    <div className="flex h-[58px] items-center justify-between border-b border-gray-400 px-4 py-2">
      <div className="inline-flex items-center gap-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="text-gray-80 flex items-center gap-2"
                onClick={() => setChatSidebarCollapsed(!isChatSidebarCollapsed)}
                size="icon"
                variant="tertiary"
              >
                {isChatSidebarCollapsed ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isChatSidebarCollapsed ? 'Open' : 'Close'} Chat Sidebar
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="flex flex-col items-center gap-1">
                <p> Toggle Chat Sidebar</p>
                <div className="text-gray-80 flex items-center justify-center gap-2 text-center">
                  <span>⌘</span>
                  <span>B</span>
                </div>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
        <span className="mr-2.5 line-clamp-1 inline text-sm font-medium capitalize text-white">
          {currentInbox?.custom_name || currentInbox?.inbox_id}
        </span>
      </div>
      {hasConversationContext ? (
        <Button
          className={cn(
            'flex h-auto w-auto items-center gap-2 rounded-lg bg-gray-400 px-2.5 py-1.5',
          )}
          onClick={() => {
            setSetJobScopeOpen(true);
          }}
          size="auto"
          type="button"
          variant="ghost"
        >
          <div className="flex items-center gap-2">
            <FilesIcon className="h-4 w-4" />
            <p className="text-xs text-white">{t('vectorFs.localFiles')}</p>
          </div>
          {filesAndFoldersCount > 0 && (
            <Badge className="bg-brand inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 p-0 text-center text-gray-50">
              {filesAndFoldersCount}
            </Badge>
          )}
        </Button>
      ) : (
        <Button
          className={cn(
            'flex h-auto w-auto items-center gap-2 rounded-lg bg-gray-400 px-2.5 py-1.5',
          )}
          onClick={() => {
            setSetJobScopeOpen(true);
          }}
          size="auto"
          type="button"
          variant="ghost"
        >
          <div className="flex items-center gap-2">
            <FilesIcon className="h-4 w-4" />
            <p className="text-xs text-white"> {t('vectorFs.localFiles')}</p>
          </div>
          {Object.keys(selectedKeys || {}).length > 0 ? (
            <Badge className="bg-brand inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 p-0 text-center text-gray-50">
              {Object.keys(selectedKeys || {}).length}
            </Badge>
          ) : (
            <Badge className="inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 bg-gray-200 p-0 text-center text-gray-50">
              <PlusIcon className="h-3.5 w-3.5" />
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
};

const ConversationHeader = () => {
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);

  if (inboxId) {
    return <ConversationHeaderWithInboxId />;
  }

  return <ConversationHeaderEmpty />;
};

export default ConversationHeader;
