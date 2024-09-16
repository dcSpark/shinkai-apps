import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { useGetJobScope } from '@shinkai_network/shinkai-node-state/v2/queries/getJobScope/useGetJobScope';
import {
  Badge,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  DirectoryTypeIcon,
  FilesIcon,
  FileTypeIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { PanelRightClose } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';

const ConversationHeader = () => {
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

  const { data: jobScope, isSuccess } = useGetJobScope(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
    },
    {
      enabled: !!inboxId,
    },
  );

  const hasFolders = isSuccess && jobScope.vector_fs_folders.length > 0;
  const hasFiles = isSuccess && jobScope.vector_fs_items.length > 0;

  const filesAndFoldersCount = isSuccess
    ? jobScope?.vector_fs_folders.length + jobScope?.vector_fs_items.length
    : 0;
  const hasConversationContext = hasFolders || hasFiles;

  return (
    <div className="flex h-[58px] items-center justify-between border-b border-gray-400 px-4 py-2">
      <div className="inline-flex items-center gap-2">
        {isChatSidebarCollapsed && (
          <Button
            className="text-gray-80 flex items-center gap-2"
            onClick={() => setChatSidebarCollapsed(!isChatSidebarCollapsed)}
            size="icon"
            variant="tertiary"
          >
            <PanelRightClose className="h-4 w-4" />
            <span className="sr-only">Open Chat Sidebar</span>
          </Button>
        )}
        {currentInbox ? (
          <span className="mr-2.5 line-clamp-1 inline text-sm font-medium capitalize text-white">
            {currentInbox?.custom_name || currentInbox?.inbox_id}
          </span>
        ) : (
          <span className="mr-2.5 line-clamp-1 inline text-sm font-medium capitalize text-white">
            New Chat
          </span>
        )}
      </div>
      {hasConversationContext && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className={cn(
                'flex h-auto items-center gap-2 rounded-lg bg-gray-400 px-2.5 py-1.5',
                'w-auto',
              )}
              size="auto"
              type="button"
              variant="ghost"
            >
              <div className="flex items-center gap-2">
                <FilesIcon className="h-4 w-4" />
                <p className="text-xs text-white">{t('vectorFs.localFiles')}</p>
              </div>
              {filesAndFoldersCount > 0 && (
                <Badge className="bg-gray-350 inline-flex h-5 w-5 items-center justify-center rounded-full border-gray-200 p-0 text-center text-gray-50">
                  {filesAndFoldersCount}
                </Badge>
              )}
            </Button>

            {/*<Button*/}
            {/*  className="flex h-auto items-center gap-4 bg-transparent px-2.5 py-1.5"*/}
            {/*  variant="ghost"*/}
            {/*>*/}
            {/*  {hasFolders && (*/}
            {/*    <span className="text-gray-80 flex items-center gap-1 text-xs font-medium">*/}
            {/*      <DirectoryTypeIcon className="ml-1 h-4 w-4" />*/}
            {/*      {t('common.folderWithCount', {*/}
            {/*        count: (jobScope?.vector_fs_folders ?? [])*/}
            {/*          .length,*/}
            {/*      })}*/}
            {/*    </span>*/}
            {/*  )}*/}
            {/*  {hasFiles && (*/}
            {/*    <span className="text-gray-80 flex items-center gap-1 truncate text-xs font-medium">*/}
            {/*      <FileTypeIcon className="ml-1 h-4 w-4" />*/}
            {/*      {t('common.fileWithCount', {*/}
            {/*        count: (currentInbox?.job_scope?.vector_fs_items ?? [])*/}
            {/*          .length,*/}
            {/*      })}*/}
            {/*    </span>*/}
            {/*  )}*/}
            {/*</Button>*/}
          </SheetTrigger>
          <SheetContent className="max-w-md">
            <SheetHeader>
              <SheetTitle>{t('chat.context.title')}</SheetTitle>
              <SheetDescription className="mb-4 mt-2">
                {t('chat.context.description')}
              </SheetDescription>
              <div className="space-y-3 pt-4">
                {hasFolders && (
                  <div className="space-y-1">
                    <span className="font-medium text-white">
                      {t('common.folders')}
                    </span>
                    <ul>
                      {jobScope.vector_fs_folders.map((folder) => (
                        <li
                          className="flex items-center gap-2 py-1.5"
                          key={folder.path}
                        >
                          <DirectoryTypeIcon />
                          <span className="text-gray-80 text-xs text-white">
                            {folder.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {hasFiles && (
                  <div className="space-y-1">
                    <span className="font-medium text-white">
                      {t('common.files')}
                    </span>
                    <ul>
                      {jobScope.vector_fs_items.map((file) => (
                        <li
                          className="flex items-center gap-2 py-1.5"
                          key={file.path}
                        >
                          <FileTypeIcon />
                          <span className="text-gray-80 text-xs text-white">
                            {file.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};
export default ConversationHeader;
