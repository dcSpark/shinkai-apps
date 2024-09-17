import {
  Alert,
  AlertDescription,
  AlertTitle,
  Progress,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Loader2, RefreshCw, Rocket } from 'lucide-react';

import {
  UpdateState,
  useCheckUpdateQuery,
  useDownloadUpdateMutation,
  useUpdateStateQuery,
} from '../../lib/updater/updater-client';
import { showAnimation } from '../../pages/layout/main-layout';
import { useSettings } from '../../store/settings';

export const UpdateBanner = ({ className }: { className?: string }) => {
  const CHECK_UPDATE_INTERVAL_MS = 30 * 60 * 1000;
  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);
  useCheckUpdateQuery({
    refetchInterval: CHECK_UPDATE_INTERVAL_MS,
  });
  const { data: updateState } = useUpdateStateQuery();
  const { mutateAsync: downloadUpdate } = useDownloadUpdateMutation({});

  const downloadAndInstall = (): void => {
    switch (updateState?.state) {
      case 'available':
        downloadUpdate();
        break;
      default:
        break;
    }
  };

  const updateStateUI = (updateState: UpdateState) => {
    if (updateState?.state === 'available') {
      return (
        <div className="flex flex-row items-center space-x-1">
          <Download className="h-5 w-5 shrink-0" />
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                animate="show"
                className="whitespace-nowrap text-xs"
                exit="hidden"
                initial="hidden"
                variants={showAnimation}
              >
                New update available!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      );
    } else if (
      updateState?.state === 'downloading' &&
      updateState?.downloadState?.state === 'downloading'
    ) {
      return (
        <div className="flex w-full flex-col items-center justify-center space-y-1">
          <span>
            {updateState?.downloadState.data.downloadProgressPercent}%
          </span>
          <Progress
            className="h-2 w-full"
            max={100}
            value={updateState?.downloadState.data.downloadProgressPercent}
          />
        </div>
      );
    } else if (updateState?.state === 'restarting') {
      return (
        <div className="flex flex-row items-center space-x-1">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
        </div>
      );
    }
  };

  const banner = (
    <Alert className="shadow-lg" variant="success">
      <Rocket className="h-4 w-4" />
      <AlertTitle className="text-sm font-medium">
        New update available!
      </AlertTitle>
      <AlertDescription className="text-xs">
        <div className="mt-2 flex flex-col gap-1">
          <div>
            A new Shinkai Desktop version{' '}
            <span className="font-bold">v{updateState?.update?.version}</span>{' '}
            is ready to be installed.
          </div>
          <div className="">This will restart the application.</div>
        </div>
      </AlertDescription>
    </Alert>
  );
  if (updateState?.update?.available) {
    return (
      <div
        className={cn('flex w-full flex-col text-xs', className)}
        onClick={() => downloadAndInstall()}
      >
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <Alert
                className={cn(
                  'shadow-lg [&>svg]:static [&>svg~*]:pl-0',
                  'flex w-full items-center gap-2 rounded-lg px-4 py-2',
                )}
                variant="success"
              >
                <div className="flex w-full flex-col space-y-1">
                  {updateStateUI(updateState)}
                </div>
              </Alert>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                align="center"
                arrowPadding={2}
                className="max-w-md p-0"
                side="right"
              >
                {banner}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
};
