import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
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
  FileTypeIcon,
} from '@shinkai_network/shinkai-ui/assets';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';

const ConversationHeader = () => {
  const currentInbox = useGetCurrentInbox();
  const { t } = useTranslation();
  const hasFolders =
    (currentInbox?.job_scope?.vector_fs_folders ?? [])?.length > 0;
  const hasFiles = (currentInbox?.job_scope?.vector_fs_items ?? [])?.length > 0;

  const hasConversationContext = hasFolders || hasFiles;

  return (
    <div className="flex h-[58px] items-center justify-between border-b border-gray-400 px-4 py-2">
      <div className="inline-flex items-center">
        <span className="mr-2.5 line-clamp-1 inline text-sm font-medium capitalize text-white">
          {currentInbox?.custom_name || currentInbox?.inbox_id}
        </span>
      </div>
      {hasConversationContext && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="flex h-auto items-center gap-4 bg-transparent px-2.5 py-1.5"
              variant="ghost"
            >
              {hasFolders && (
                <span className="text-gray-80 flex items-center gap-1 text-xs font-medium">
                  <DirectoryTypeIcon className="ml-1 h-4 w-4" />
                  {t('common.folderWithCount', {
                    count: (currentInbox?.job_scope?.vector_fs_folders ?? [])
                      .length,
                  })}
                </span>
              )}
              {hasFiles && (
                <span className="text-gray-80 flex items-center gap-1 truncate text-xs font-medium">
                  <FileTypeIcon className="ml-1 h-4 w-4" />
                  {t('common.fileWithCount', {
                    count: (currentInbox?.job_scope?.vector_fs_items ?? [])
                      .length,
                  })}
                </span>
              )}
            </Button>
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
                      {currentInbox?.job_scope?.vector_fs_folders?.map(
                        (folder) => (
                          <li
                            className="flex items-center gap-2 py-1.5"
                            key={folder}
                          >
                            <DirectoryTypeIcon />
                            <span className="text-gray-80 text-xs text-white">
                              {folder}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
                {hasFiles && (
                  <div className="space-y-1">
                    <span className="font-medium text-white">
                      {t('common.files')}
                    </span>
                    <ul>
                      {currentInbox?.job_scope?.vector_fs_items?.map((file) => (
                        <li
                          className="flex items-center gap-2 py-1.5"
                          key={file}
                        >
                          <FileTypeIcon />
                          <span className="text-gray-80 text-xs text-white">
                            {file}
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
