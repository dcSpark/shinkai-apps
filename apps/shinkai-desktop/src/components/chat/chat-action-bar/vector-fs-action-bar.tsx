import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { useGetListDirectoryContents } from '@shinkai_network/shinkai-node-state/v2/queries/getDirectoryContents/useGetListDirectoryContents';
import { useGetJobFolderName } from '@shinkai_network/shinkai-node-state/v2/queries/getJobFolderName/useGetJobFolderName';
import { useGetJobScope } from '@shinkai_network/shinkai-node-state/v2/queries/getJobScope/useGetJobScope';
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { FilesIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useParams } from 'react-router-dom';

import { useAuth } from '../../../store/auth';
import { useSetJobScope } from '../context/set-job-scope-context';
import { actionButtonClassnames } from '../conversation-footer';

type OpenChatFolderActionBarProps = {
  onClick: () => void;
  disabled?: boolean;
  aiFilesCount?: number;
};

function VectorFsActionBarBase({
  onClick,
  aiFilesCount = 0,
  disabled,
}: OpenChatFolderActionBarProps) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              actionButtonClassnames,
              'w-auto gap-2',
              disabled && 'opacity-50',
              aiFilesCount > 0 && 'bg-cyan-950 hover:bg-cyan-950',
            )}
            disabled={disabled}
            onClick={onClick}
            type="button"
          >
            {aiFilesCount > 0 ? (
              <Badge className="bg-official-gray-1000 inline-flex size-4 items-center justify-center rounded-full border-gray-200 p-0 text-center text-[10px] text-gray-50">
                {aiFilesCount}
              </Badge>
            ) : (
              <FilesIcon className="size-4" />
            )}
            Local AI Files
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent align="center" side="top">
            Local AI Files
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </>
  );
}

export function UpdateVectorFsActionBar() {
  const auth = useAuth((state) => state.auth);
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const setSetJobScopeOpen = useSetJobScope(
    (state) => state.setSetJobScopeOpen,
  );

  const { data: jobScope, isSuccess } = useGetJobScope(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
    },
    { enabled: !!inboxId },
  );

  const { data: jobFolderData } = useGetJobFolderName({
    jobId: extractJobIdFromInbox(inboxId),
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { data: fileInfoArray, isSuccess: isVRFilesSuccess } =
    useGetListDirectoryContents(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        path: decodeURIComponent(jobFolderData?.folder_name ?? '') ?? '',
      },
      {
        enabled: !!jobFolderData?.folder_name,
        retry: 1,
      },
    );

  const hasFilesJobFolder = isVRFilesSuccess && fileInfoArray.length > 0;

  // const hasFolders = isSuccess && jobScope.vector_fs_folders.length > 0;
  // const hasFiles = isSuccess && jobScope.vector_fs_items.length > 0;

  const filesAndFoldersCount = isSuccess
    ? jobScope.vector_fs_folders.length +
      jobScope.vector_fs_items.length +
      (hasFilesJobFolder ? 1 : 0)
    : 0;

  const handleUpdateVectorFs = async () => {
    setSetJobScopeOpen(true);
  };

  return (
    <VectorFsActionBarBase
      aiFilesCount={filesAndFoldersCount}
      onClick={handleUpdateVectorFs}
    />
  );
}
export const VectorFsActionBar = VectorFsActionBarBase;
