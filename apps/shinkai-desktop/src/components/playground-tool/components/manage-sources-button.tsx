import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useRemoveAssetTool } from '@shinkai_network/shinkai-node-state/v2/mutations/removeAssetTool/useRemoveAssetTool';
import { useUploadAssetsTool } from '@shinkai_network/shinkai-node-state/v2/mutations/uploadAssetsTool/useUploadAssetsTool';
import { useGetAllToolAssets } from '@shinkai_network/shinkai-node-state/v2/queries/getAllToolAssets/useGetAllToolAssets';
import { Badge, Button, Separator } from '@shinkai_network/shinkai-ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  fileIconMap,
  FileTypeIcon,
  ToolAssetsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { getFileExt } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Loader2, Paperclip, Upload, XIcon } from 'lucide-react';
import { memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';
import { usePlaygroundStore } from '../context/playground-context';

function ManageSourcesButtonBase() {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();

  const xShinkaiAppId = usePlaygroundStore((state) => state.xShinkaiAppId);
  const xShinkaiToolId = usePlaygroundStore((state) => state.xShinkaiToolId);

  const { data: assets, isSuccess: isGetAllToolAssetsSuccess } =
    useGetAllToolAssets({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      xShinkaiAppId,
      xShinkaiToolId,
    });

  const { mutateAsync: uploadAssets, isPending: isUploadingAssets } =
    useUploadAssetsTool({
      onError: (error) => {
        toast.error('Failed uploading source:', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const { mutateAsync: removeAsset } = useRemoveAssetTool({
    onError: (error) => {
      toast.error('Failed removing source:', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: true,
      onDrop: async (acceptedFiles) => {
        await uploadAssets({
          nodeAddress: auth?.node_address ?? '',
          token: auth?.api_v2_key ?? '',
          files: acceptedFiles,
          xShinkaiAppId,
          xShinkaiToolId,
        });
      },
    });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="text-gray-80 relative shrink-0"
          rounded="lg"
          size="xs"
          variant="outline"
        >
          <ToolAssetsIcon className="text-gray-80 h-4 w-4" />
          File Attachment
          {isGetAllToolAssetsSuccess && assets.length > 0 && (
            <Badge className="bg-official-gray-800 min-w-5 rounded-full px-1 text-white">
              {assets.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[60vh] max-w-[500px] flex-col gap-4">
        <DialogClose className="absolute right-4 top-4">
          <XIcon className="text-gray-80 h-5 w-5" />
        </DialogClose>
        <div className="space-y-2">
          <DialogTitle className="pb-0">Attach files to your tool</DialogTitle>
          <DialogDescription className="text-xs">
            It is used to provide context to the large language model.
          </DialogDescription>
        </div>

        <div
          {...getRootFileProps({
            className:
              'dropzone py-4 bg-gray-400 group relative  flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-200 transition-colors hover:border-gray-100',
          })}
        >
          <div className="flex flex-col items-center justify-center space-y-1 px-2">
            <div className="bg-gray-350 rounded-full p-2 shadow-sm">
              <Upload className="h-4 w-4" />
            </div>
            <p className="text-sm text-white">{t('common.clickToUpload')}</p>

            <p className="text-gray-80 line-clamp-1 text-xs">
              {t('common.uploadAFileDescription')}
            </p>
          </div>

          <input {...getInputFileProps({})} />
        </div>
        <Separator className="my-1 bg-gray-200" orientation="horizontal" />
        <div
          className={cn(
            'flex flex-1 flex-col gap-2 overflow-y-auto pr-2',
            (assets ?? []).length > 5,
          )}
        >
          {isGetAllToolAssetsSuccess && assets.length === 0 && (
            <span className="text-gray-80 text-center text-xs">
              No files uploaded yet.
            </span>
          )}
          {isUploadingAssets && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="text-gray-80 shrink-0 animate-spin" />
              <span className="text-gray-80 text-center text-xs">
                Uploading files...
              </span>
            </div>
          )}
          {isGetAllToolAssetsSuccess &&
            assets.map((asset) => (
              <div
                className="border-official-gray-780 flex items-center justify-between gap-2 overflow-hidden rounded-lg border px-1.5 py-2"
                key={asset}
              >
                <div className="flex items-center gap-2 overflow-hidden text-gray-50">
                  <div className="w-4.5 flex aspect-square shrink-0 items-center justify-center">
                    {getFileExt(asset) && fileIconMap[getFileExt(asset)] ? (
                      <FileTypeIcon
                        className="text-gray-80 h-[18px] w-[18px] shrink-0"
                        type={getFileExt(asset)}
                      />
                    ) : (
                      <Paperclip className="text-gray-80 h-3.5 w-3.5 shrink-0" />
                    )}
                  </div>
                  <Tooltip delayDuration={1000}>
                    <TooltipTrigger>
                      <span className="overflow-hidden text-ellipsis text-sm">
                        {decodeURIComponent(asset)}
                      </span>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent align="start" side="top">
                        {decodeURIComponent(asset)}
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </div>
                <Button
                  className="text-gray-80 !size-5 shrink-0 border-0 p-0.5 hover:text-white"
                  onClick={async () => {
                    await removeAsset({
                      nodeAddress: auth?.node_address ?? '',
                      token: auth?.api_v2_key ?? '',
                      xShinkaiAppId,
                      xShinkaiToolId,
                      filename: asset,
                    });
                  }}
                  size="auto"
                  variant="outline"
                >
                  <XIcon className="size-full" />
                </Button>
              </div>
            ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              className="min-w-[100px]"
              size="sm"
              type="button"
              variant="default"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const ManageSourcesButton = memo(ManageSourcesButtonBase, () => true);
