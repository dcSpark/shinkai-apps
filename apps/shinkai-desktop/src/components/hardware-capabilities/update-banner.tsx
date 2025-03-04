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
import { Download, Loader2, Rocket } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

import {
  UpdateState,
  useCheckUpdateQuery,
  useDownloadUpdateMutation,
  useUpdateStateQuery,
} from '../../lib/updater/updater-client';
import { showAnimation } from '../../pages/layout/main-layout';
import { useSettings } from '../../store/settings';

const CHECK_UPDATE_INTERVAL_MS = 30 * 60 * 1000;

const UpdateStateUI: React.FC<{
  updateState: UpdateState['state'];
  downloadProgressPercent: number;
  sidebarExpanded: boolean;
}> = ({ updateState, downloadProgressPercent, sidebarExpanded }) => {
  switch (updateState) {
    case 'available':
      return (
        <div className="flex flex-row items-center gap-2">
          <Download className="size-5 shrink-0" />
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
    case 'downloading':
      return (
        <div className="flex w-full flex-col items-center justify-center space-y-1">
          <span>{downloadProgressPercent}%</span>
          <Progress
            className="h-2 w-full"
            max={100}
            value={downloadProgressPercent}
          />
        </div>
      );
    case 'restarting':
      return (
        <div className="flex flex-row items-center space-x-1">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
        </div>
      );
    default:
      return null;
  }
};

UpdateStateUI.displayName = 'UpdateStateUI';

const UpdateBanner: React.FC<{
  className?: string;
  // TODO: temporary fix to display banner on onboarding step, ideally we should add check for updates in the tray options
  isOnboardingStep?: boolean;
}> = ({ className, isOnboardingStep }) => {
  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);
  const { data: updateState } = useUpdateStateQuery();
  const { mutateAsync: downloadUpdate } = useDownloadUpdateMutation();

  useCheckUpdateQuery({
    refetchInterval: CHECK_UPDATE_INTERVAL_MS,
  });

  const downloadAndInstall = useCallback((): void => {
    if (updateState?.state === 'available') {
      downloadUpdate();
    }
  }, [updateState?.state, downloadUpdate]);

  const banner = useMemo(
    () => (
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
    ),
    [updateState?.update?.version],
  );

  if (!updateState?.update?.available) {
    return null;
  }

  return (
    <div
      className={cn('flex w-full flex-col text-xs', className)}
      onClick={downloadAndInstall}
    >
      <TooltipProvider delayDuration={isOnboardingStep ? 100000 : 0}>
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
                <UpdateStateUI
                  downloadProgressPercent={
                    updateState.downloadState?.data?.downloadProgressPercent ||
                    0
                  }
                  sidebarExpanded={sidebarExpanded || !!isOnboardingStep}
                  updateState={updateState.state}
                />
                {isOnboardingStep && updateState.state === 'available' && (
                  <span className="pl-[28px] text-xs text-white/80">
                    Click here to install the latest available version.
                  </span>
                )}
              </div>
            </Alert>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              align="center"
              arrowPadding={2}
              className="max-w-md p-0"
              side={isOnboardingStep ? 'bottom' : 'right'}
            >
              {banner}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

UpdateBanner.displayName = 'UpdateBanner';

export { UpdateBanner };
